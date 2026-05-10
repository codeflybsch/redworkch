
import { Controller, Get } from '@nestjs/common';
import { SupportService } from './support.service';

@Controller('support')
export class SupportController {
  constructor(private readonly service: SupportService) {}

  @Get()
  index() {
    return this.service.health();
  }
}
