import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';

import { Signal } from './signal.service';

@Processor('signal-queue')
export class SignalProcessor extends WorkerHost {
  private readonly logger = new Logger(SignalProcessor.name);

  async process(job: Job<Signal>): Promise<void> {
    const signal = job.data;

    this.logger.log(
      `Processing signal: ${signal.type} ${signal.symbol} @ ${signal.price}`,
    );

    try {
      // TODO: trade-engine API를 호출하여 실제 주문 생성
      // 현재는 로그만 출력
      this.logger.log(`Signal processed: ${JSON.stringify(signal)}`);

      // 실제 구현시:
      // await this.httpService.post('http://trade-engine:3002/orders', {
      //   accountId: '...',
      //   exchange: '...',
      //   symbol: signal.symbol,
      //   side: signal.type === 'buy' ? 'buy' : 'sell',
      //   type: 'market',
      //   amount: calculateAmount(signal),
      // });
    } catch (error) {
      this.logger.error(`Failed to process signal: ${error}`);
      throw error;
    }
  }
}
