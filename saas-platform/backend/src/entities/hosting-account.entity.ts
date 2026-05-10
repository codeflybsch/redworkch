import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  Index,
} from 'typeorm';
import { User } from './user.entity';
import { HostingPackage } from './hosting-package.entity';
import { HostingServer } from './hosting-server.entity';
import { Order } from './order.entity';

export enum AccountStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  TERMINATED = 'terminated',
  FAILED = 'failed',
}

@Entity('hosting_accounts')
@Index(['cpanelUsername'], { unique: true })
@Index(['customerId', 'status'])
export class HostingAccount {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  customerId: string;

  @ManyToOne(() => User, (user) => user.hostingAccounts, {
    onDelete: 'CASCADE',
  })
  customer: User;

  @Column()
  packageId: string;

  @ManyToOne(() => HostingPackage, (pkg) => pkg.hostingAccounts, {
    onDelete: 'SET NULL',
  })
  package: HostingPackage;

  @Column()
  serverId: string;

  @ManyToOne(() => HostingServer, (server) => server.hostingAccounts, {
    onDelete: 'RESTRICT',
  })
  server: HostingServer;

  @Column({ nullable: true })
  orderId: string;

  @ManyToOne(() => Order, { onDelete: 'SET NULL' })
  order: Order;

  @Column({ unique: true })
  cpanelUsername: string;

  @Column({ select: false })
  cpanelPassword: string; // encrypted in production

  @Column()
  mainDomain: string;

  @Column({ type: 'enum', enum: AccountStatus, default: AccountStatus.PENDING })
  status: AccountStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  usedDiskSpace: number; // in GB

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  usedBandwidth: number; // in GB

  @Column({ nullable: true })
  suspensionReason: string;

  @Column({ nullable: true })
  suspendedAt: Date;

  @Column({ nullable: true })
  renewalDate: Date;

  @Column({ default: true })
  autoRenewal: boolean;

  @Column({ nullable: true })
  cpanelAccessUrl: string;

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Methods
  isExpired(): boolean {
    if (!this.renewalDate) return false;
    return new Date() > this.renewalDate;
  }

  isSuspended(): boolean {
    return this.status === AccountStatus.SUSPENDED;
  }
}
