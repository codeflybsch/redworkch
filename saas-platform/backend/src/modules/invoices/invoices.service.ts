
import { Injectable } from '@nestjs/common';

@Injectable()
export class InvoicesService {
  health() {
    return { module: 'invoices', status: 'ready' };
  }
}
