import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '@/entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    company?: string;
    phone?: string;
    role?: UserRole;
  }): Promise<User> {
    const existingUser = await this.usersRepository.findOne({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new ConflictException('E-Mail-Adresse ist bereits registriert');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = this.usersRepository.create({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      passwordHash: hashedPassword,
      company: data.company,
      phone: data.phone,
      role: data.role || UserRole.CUSTOMER,
      emailVerified: false,
    });

    return this.usersRepository.save(user);
  }

  async findById(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('Benutzer nicht gefunden');
    }

    return user;
  }

  async findByEmail(email: string): Promise<User> {
    return this.usersRepository.findOne({
      where: { email },
      select: ['id', 'email', 'firstName', 'lastName', 'passwordHash', 'role', 'isActive'],
    });
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    const user = await this.findById(id);

    if (data.email && data.email !== user.email) {
      const existing = await this.usersRepository.findOne({
        where: { email: data.email },
      });
      if (existing) {
        throw new ConflictException('E-Mail-Adresse ist bereits in Verwendung');
      }
    }

    Object.assign(user, data);
    return this.usersRepository.save(user);
  }

  async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<void> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      select: ['id', 'passwordHash'],
    });

    if (!user) {
      throw new NotFoundException('Benutzer nicht gefunden');
    }

    const isValid = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!isValid) {
      throw new BadRequestException('Altes Passwort ist ungültig');
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await this.usersRepository.save(user);
  }

  async findAll(skip: number = 0, take: number = 10) {
    return this.usersRepository.find({
      skip,
      take,
      order: { createdAt: 'DESC' },
    });
  }

  async deactivate(id: string): Promise<void> {
    await this.usersRepository.update(id, { isActive: false });
  }

  async activate(id: string): Promise<void> {
    await this.usersRepository.update(id, { isActive: true });
  }
}
