import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { HostingService } from './hosting.service';
import { HostingController } from './hosting.controller';
import { WHMService } from './services/whm.service';
import { HostingPackage } from '@/entities/hosting-package.entity';
import { HostingServer } from '@/entities/hosting-server.entity';
import { HostingAccount } from '@/entities/hosting-account.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      HostingPackage,
      HostingServer,
      HostingAccount,
    ]),
    BullModule.registerQueue({
      name: 'hosting-provisioning',
    }),
  ],
  providers: [HostingService, WHMService],
  controllers: [HostingController],
  exports: [HostingService, WHMService],
})
export class HostingModule {}
