
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { DomainAuction, DomainAuctionStatus } from '@/entities/domain-auction.entity';
import { DomainBid } from '@/entities/domain-bid.entity';

@Injectable()
export class DomainsService {
  constructor(
    @InjectRepository(DomainAuction) private auctions: Repository<DomainAuction>,
    @InjectRepository(DomainBid) private bids: Repository<DomainBid>,
    private dataSource: DataSource,
  ) {}

  listLiveAuctions() {
    return this.auctions.find({ where: { status: DomainAuctionStatus.LIVE }, order: { endsAt: 'ASC' } });
  }

  async createAuction(data: Partial<DomainAuction>) {
    return this.auctions.save(this.auctions.create(data));
  }

  async placeBid(auctionId: string, bidderId: string, amount: number) {
    return this.dataSource.transaction(async (manager) => {
      const auction = await manager.findOne(DomainAuction, { where: { id: auctionId } });
      if (!auction) throw new NotFoundException('Auktion nicht gefunden');
      if (auction.status !== DomainAuctionStatus.LIVE) throw new BadRequestException('Auktion ist nicht live');
      if (Number(amount) <= Number(auction.currentBid)) throw new BadRequestException('Gebot muss höher sein');

      auction.currentBid = amount;
      auction.currentWinnerId = bidderId;
      await manager.save(auction);

      return manager.save(DomainBid, { auctionId, bidderId, amount, currency: 'CHF' });
    });
  }
}
