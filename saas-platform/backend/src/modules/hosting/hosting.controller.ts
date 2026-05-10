
import { Body, Controller, Get, Param, Post, Patch } from '@nestjs/common';
import { HostingService } from './hosting.service';

@Controller('hosting')
export class HostingController {
  constructor(private readonly hostingService: HostingService) {}

  @Get('packages')
  getPackages() {
    return this.hostingService.getPackages(true);
  }

  @Get('servers')
  getServers() {
    return this.hostingService.getServers();
  }

  @Get('accounts/:customerId')
  getCustomerAccounts(@Param('customerId') customerId: string) {
    return this.hostingService.getAccountsByCustomer(customerId);
  }

  @Post('provision')
  provision(@Body() body: { customerId: string; packageId: string; mainDomain: string; serverId?: string }) {
    return this.hostingService.provisionAccount(body.customerId, body.packageId, body.mainDomain, body.serverId);
  }

  @Patch('accounts/:id/suspend')
  suspend(@Param('id') id: string, @Body('reason') reason?: string) {
    return this.hostingService.suspendAccount(id, reason);
  }

  @Patch('accounts/:id/unsuspend')
  unsuspend(@Param('id') id: string) {
    return this.hostingService.activateAccount(id);
  }

  @Patch('accounts/:id/remove')
  remove(@Param('id') id: string) {
    return this.hostingService.removeAccount(id);
  }
}
