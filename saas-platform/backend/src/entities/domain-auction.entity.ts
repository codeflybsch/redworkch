
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn, Index } from 'typeorm';

export enum DomainAuctionStatus {
  DRAFT = 'draft',
  LIVE = 'live',
  SOLD = 'sold',
  EXPIRED = 'expired',
}

@Entity('domain_auctions')
@Index(['domainName'], { unique: true })
export class DomainAuction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  domainName: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  startPrice: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  currentBid: number;

  @Column({ nullable: true })
  currentWinnerId: string;

  @Column({ type: 'timestamp' })
  endsAt: Date;

  @Column({ type: 'enum', enum: DomainAuctionStatus, default: DomainAuctionStatus.DRAFT })
  status: DomainAuctionStatus;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
