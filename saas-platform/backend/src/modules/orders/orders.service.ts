
import { Injectable } from '@nestjs/common';

@Injectable()
export class OrdersService {
  health() {
    return { module: 'orders', status: 'ready' };
  }
}
