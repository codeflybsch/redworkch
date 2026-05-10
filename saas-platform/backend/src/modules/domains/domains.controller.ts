
import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { DomainsService } from './domains.service';

@Controller('domains')
export class DomainsController {
  constructor(private readonly domainsService: DomainsService) {}

  @Get('auctions')
  listLiveAuctions() {
    return this.domainsService.listLiveAuctions();
  }

  @Post('auctions')
  createAuction(@Body() body: any) {
    return this.domainsService.createAuction(body);
  }

  @Post('auctions/:id/bids')
  placeBid(@Param('id') id: string, @Body() body: { bidderId: string; amount: number }) {
    return this.domainsService.placeBid(id, body.bidderId, body.amount);
  }
}
