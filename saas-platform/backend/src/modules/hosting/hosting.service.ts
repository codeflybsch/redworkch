import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { HostingPackage } from '@/entities/hosting-package.entity';
import { HostingServer } from '@/entities/hosting-server.entity';
import { HostingAccount, AccountStatus } from '@/entities/hosting-account.entity';
import { WHMService } from './services/whm.service';

@Injectable()
export class HostingService {
  private readonly logger = new Logger(HostingService.name);

  constructor(
    @InjectRepository(HostingPackage)
    private packagesRepository: Repository<HostingPackage>,
    @InjectRepository(HostingServer)
    private serversRepository: Repository<HostingServer>,
    @InjectRepository(HostingAccount)
    private accountsRepository: Repository<HostingAccount>,
    @InjectQueue('hosting-provisioning')
    private provisioningQueue: Queue,
    private whmService: WHMService,
  ) {}

  // ===== PACKAGES =====
  async getPackages(isActive: boolean = true) {
    return this.packagesRepository.find({
      where: { isActive },
      order: { displayOrder: 'ASC' },
    });
  }

  async getPackageById(id: string) {
    const pkg = await this.packagesRepository.findOne({ where: { id } });
    if (!pkg) throw new NotFoundException('Paket nicht gefunden');
    return pkg;
  }

  async createPackage(data: Partial<HostingPackage>) {
    const pkg = this.packagesRepository.create(data);
    return this.packagesRepository.save(pkg);
  }

  async updatePackage(id: string, data: Partial<HostingPackage>) {
    await this.packagesRepository.update(id, data);
    return this.getPackageById(id);
  }

  // ===== SERVERS =====
  async getServers() {
    return this.serversRepository.find({ order: { createdAt: 'DESC' } });
  }

  async getActiveServers() {
    return this.serversRepository.find({
      where: { isActive: true },
      order: { currentAccounts: 'ASC' },
    });
  }

  async getServerById(id: string) {
    const server = await this.serversRepository.findOne({ where: { id } });
    if (!server) throw new NotFoundException('Server nicht gefunden');
    return server;
  }

  async createServer(data: Partial<HostingServer>) {
    const server = this.serversRepository.create(data);
    return this.serversRepository.save(server);
  }

  async updateServerStatus(serverId: string, status: any) {
    await this.serversRepository.update(serverId, { status });
    return this.getServerById(serverId);
  }

  // ===== HOSTING ACCOUNTS =====
  async getAccountsByCustomer(customerId: string) {
    return this.accountsRepository.find({
      where: { customerId },
      relations: ['package', 'server'],
      order: { createdAt: 'DESC' },
    });
  }

  async getAccountById(id: string) {
    const account = await this.accountsRepository.findOne({
      where: { id },
      relations: ['package', 'server', 'customer'],
    });
    if (!account) throw new NotFoundException('Account nicht gefunden');
    return account;
  }

  async provisionAccount(customerId: string, packageId: string, mainDomain: string, serverId?: string) {
    this.logger.log(`Starting provisioning for customer ${customerId}`);

    // Get package and server info
    const pkg = await this.getPackageById(packageId);
    
    let server: HostingServer;
    if (serverId) {
      server = await this.getServerById(serverId);
    } else {
      // Get server with least accounts
      const servers = await this.getActiveServers();
      if (!servers.length) {
        throw new Error('No active servers available');
      }
      server = servers[0];
    }

    // Create account record
    const account = this.accountsRepository.create({
      customerId,
      packageId,
      serverId: server.id,
      cpanelUsername: this.generateUsername(),
      cpanelPassword: this.generatePassword(),
      mainDomain,
      status: AccountStatus.PENDING,
    });

    const savedAccount = await this.accountsRepository.save(account);

    // Queue provisioning job
    await this.provisioningQueue.add('create-account', {
      accountId: savedAccount.id,
      serverId: server.id,
      username: account.cpanelUsername,
      password: account.cpanelPassword,
      domain: mainDomain,
      plan: pkg.name,
    });

    return savedAccount;
  }

  async updateAccountStatus(id: string, status: AccountStatus, metadata?: any) {
    await this.accountsRepository.update(id, { status, metadata });
    return this.getAccountById(id);
  }

  async suspendAccount(id: string, reason?: string) {
    const account = await this.getAccountById(id);
    
    try {
      await this.whmService.suspendAccount(account.cpanelUsername, reason);
      return this.updateAccountStatus(id, AccountStatus.SUSPENDED, { suspensionReason: reason });
    } catch (error) {
      this.logger.error(`Failed to suspend account: ${error.message}`);
      throw error;
    }
  }

  async activateAccount(id: string) {
    const account = await this.getAccountById(id);
    
    try {
      await this.whmService.unsuspendAccount(account.cpanelUsername);
      return this.updateAccountStatus(id, AccountStatus.ACTIVE);
    } catch (error) {
      this.logger.error(`Failed to activate account: ${error.message}`);
      throw error;
    }
  }

  async removeAccount(id: string) {
    const account = await this.getAccountById(id);
    
    try {
      await this.whmService.removeAccount(account.cpanelUsername);
      return this.updateAccountStatus(id, AccountStatus.TERMINATED);
    } catch (error) {
      this.logger.error(`Failed to remove account: ${error.message}`);
      throw error;
    }
  }

  async updateAccountUsage(accountId: string) {
    const account = await this.getAccountById(accountId);
    const usage = await this.whmService.getAccountUsage(account.cpanelUsername);

    if (usage) {
      await this.accountsRepository.update(accountId, {
        usedDiskSpace: usage.diskUsage,
        usedBandwidth: usage.bandwidthUsage,
      });
    }

    return this.getAccountById(accountId);
  }

  // ===== UTILITIES =====
  private generateUsername(): string {
    return `u${Math.random().toString(36).substring(2, 10)}`;
  }

  private generatePassword(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 16; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }
}
