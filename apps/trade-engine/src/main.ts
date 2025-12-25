import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';

import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('TradeEngine');
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  const port = process.env.TRADE_ENGINE_PORT || 3002;
  await app.listen(port);

  logger.log(`Trade Engine is running on port ${port}`);
}

bootstrap();
