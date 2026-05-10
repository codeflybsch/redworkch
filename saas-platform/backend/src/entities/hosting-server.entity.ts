import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { HostingAccount } from './hosting-account.entity';

export enum ServerStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  MAINTENANCE = 'maintenance',
  ERROR = 'error',
}

@Entity('hosting_servers')
@Index(['hostname'], { unique: true })
export class HostingServer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  hostname: string;

  @Column()
  ipAddress: string;

  @Column()
  whmUsername: string;

  @Column({ select: false })
  whmApiToken: string;

  @Column({ default: 'https://whm.example.com:2087' })
  whmUrl: string;

  @Column({ type: 'int', default: 100 })
  maxAccounts: number;

  @Column({ type: 'int', default: 0 })
  currentAccounts: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalDiskSpace: number; // in GB

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  usedDiskSpace: number; // in GB

  @Column({ type: 'enum', enum: ServerStatus, default: ServerStatus.ACTIVE })
  status: ServerStatus;

  @Column({ nullable: true })
  lastSyncedAt: Date;

  @Column({ nullable: true })
  lastErrorAt: Date;

  @Column({ type: 'text', nullable: true })
  lastErrorMessage: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToMany(() => HostingAccount, (account) => account.server)
  hostingAccounts: HostingAccount[];
}
