
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DomainAuction } from '@/entities/domain-auction.entity';
import { DomainBid } from '@/entities/domain-bid.entity';
import { DomainsController } from './domains.controller';
import { DomainsService } from './domains.service';

@Module({
  imports: [TypeOrmModule.forFeature([DomainAuction, DomainBid])],
  controllers: [DomainsController],
  providers: [DomainsService],
  exports: [DomainsService],
})
export class DomainsModule {}
