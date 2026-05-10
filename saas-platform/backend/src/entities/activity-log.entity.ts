import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

export enum ActivityType {
  USER_LOGIN = 'user_login',
  USER_LOGOUT = 'user_logout',
  PASSWORD_CHANGE = 'password_change',
  ACCOUNT_CREATED = 'account_created',
  ACCOUNT_SUSPENDED = 'account_suspended',
  ACCOUNT_ACTIVATED = 'account_activated',
  ORDER_CREATED = 'order_created',
  ORDER_COMPLETED = 'order_completed',
  PAYMENT_RECEIVED = 'payment_received',
  INVOICE_SENT = 'invoice_sent',
  TICKET_CREATED = 'ticket_created',
  TICKET_UPDATED = 'ticket_updated',
  SERVER_SYNC = 'server_sync',
  ERROR = 'error',
}

@Entity('activity_logs')
@Index(['userId', 'createdAt'])
@Index(['type', 'createdAt'])
export class ActivityLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  userId: string;

  @Column({ type: 'enum', enum: ActivityType })
  type: ActivityType;

  @Column()
  description: string;

  @Column({ nullable: true })
  resourceType: string; // e.g., 'order', 'invoice', 'account'

  @Column({ nullable: true })
  resourceId: string;

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>;

  @Column({ nullable: true })
  ipAddress: string;

  @Column({ nullable: true })
  userAgent: string;

  @CreateDateColumn()
  createdAt: Date;
}
