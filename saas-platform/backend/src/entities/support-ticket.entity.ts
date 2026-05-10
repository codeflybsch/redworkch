import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  Index,
} from 'typeorm';
import { User } from './user.entity';

export enum TicketStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  WAITING_CUSTOMER = 'waiting_customer',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
}

export enum TicketPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

@Entity('support_tickets')
@Index(['customerId', 'status'])
@Index(['ticketNumber'], { unique: true })
export class SupportTicket {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  ticketNumber: string;

  @Column()
  customerId: string;

  @ManyToOne(() => User, (user) => user.supportTickets, {
    onDelete: 'CASCADE',
  })
  customer: User;

  @Column()
  subject: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'enum', enum: TicketStatus, default: TicketStatus.OPEN })
  status: TicketStatus;

  @Column({ type: 'enum', enum: TicketPriority, default: TicketPriority.MEDIUM })
  priority: TicketPriority;

  @Column({ nullable: true })
  assignedToId: string;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  assignedTo: User;

  @Column({ nullable: true })
  category: string;

  @Column({ type: 'json', nullable: true })
  attachments: string[];

  @Column({ type: 'int', default: 0 })
  replyCount: number;

  @Column({ nullable: true })
  resolvedAt: Date;

  @Column({ nullable: true })
  closedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Methods
  isClosed(): boolean {
    return this.status === TicketStatus.CLOSED;
  }

  canAddReply(): boolean {
    return this.status !== TicketStatus.CLOSED;
  }
}
