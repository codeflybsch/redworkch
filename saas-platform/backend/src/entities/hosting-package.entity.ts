import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { Order } from './order.entity';
import { HostingAccount } from './hosting-account.entity';

@Entity('hosting_packages')
@Index(['name'])
export class HostingPackage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  monthlyPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  annualPrice: number;

  @Column({ type: 'int', default: 5 })
  diskSpace: number; // in GB

  @Column({ type: 'int', default: 500 })
  bandwidthLimit: number; // in GB

  @Column({ type: 'int', default: 50 })
  emailAccounts: number;

  @Column({ type: 'int', default: 1 })
  databaseAccounts: number;

  @Column({ type: 'int', default: 1 })
  mainDomains: number;

  @Column({ type: 'int', default: 10 })
  addonDomains: number;

  @Column({ default: true })
  sslIncluded: boolean;

  @Column({ default: true })
  dailyBackups: boolean;

  @Column({ type: 'json', nullable: true })
  features: string[];

  @Column({ default: 0, type: 'int' })
  displayOrder: number;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToMany(() => Order, (order) => order.hostingPackage)
  orders: Order[];

  @OneToMany(() => HostingAccount, (account) => account.package)
  hostingAccounts: HostingAccount[];
}
