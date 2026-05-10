
import { Injectable } from '@nestjs/common';

@Injectable()
export class SupportService {
  health() {
    return { module: 'support', status: 'ready' };
  }
}
