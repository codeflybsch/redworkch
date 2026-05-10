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
import { Order } from './order.entity';

export enum InvoiceStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  PAID = 'paid',
  OVERDUE = 'overdue',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

@Entity('invoices')
@Index(['customerId', 'status'])
@Index(['invoiceNumber'], { unique: true })
export class Invoice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  invoiceNumber: string;

  @Column()
  customerId: string;

  @ManyToOne(() => User, (user) => user.invoices, { onDelete: 'CASCADE' })
  customer: User;

  @Column({ nullable: true })
  orderId: string;

  @ManyToOne(() => Order, (order) => order.invoices, { onDelete: 'SET NULL' })
  order: Order;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  tax: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  discount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total: number;

  @Column({ type: 'enum', enum: InvoiceStatus, default: InvoiceStatus.DRAFT })
  status: InvoiceStatus;

  @Column()
  dueDate: Date;

  @Column({ nullable: true })
  paidAt: Date;

  @Column({ nullable: true })
  paidAmount: number;

  @Column({ type: 'json', nullable: true })
  lineItems: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ nullable: true })
  stripeInvoiceId: string;

  @Column({ nullable: true })
  pdfUrl: string;

  @Column({ type: 'int', default: 0 })
  remindersSent: number;

  @Column({ nullable: true })
  lastReminderAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Methods
  isOverdue(): boolean {
    return (
      this.status !== InvoiceStatus.PAID &&
      this.dueDate < new Date() &&
      this.status !== InvoiceStatus.CANCELLED
    );
  }

  isFinal(): boolean {
    return [
      InvoiceStatus.PAID,
      InvoiceStatus.CANCELLED,
      InvoiceStatus.REFUNDED,
    ].includes(this.status);
  }
}
