import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.DATA_COLLECTOR_PORT || 3001;

  await app.listen(port);

  Logger.log(`🚀 Data Collector 서비스가 포트 ${port}에서 실행 중입니다`, 'Bootstrap');
}

bootstrap();
