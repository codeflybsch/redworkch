
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, Index } from 'typeorm';

@Entity('domain_bids')
@Index(['auctionId', 'createdAt'])
export class DomainBid {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  auctionId: string;

  @Column()
  bidderId: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ default: 'CHF' })
  currency: string;

  @CreateDateColumn()
  createdAt: Date;
}
