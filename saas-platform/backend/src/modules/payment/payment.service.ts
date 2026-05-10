
import { Injectable } from '@nestjs/common';

@Injectable()
export class PaymentService {
  health() {
    return { module: 'payment', status: 'ready' };
  }
}
