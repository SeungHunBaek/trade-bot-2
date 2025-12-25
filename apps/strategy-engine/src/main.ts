import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('StrategyEngine');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = process.env.STRATEGY_ENGINE_PORT || 3003;
  await app.listen(port);

  logger.log(`Strategy Engine is running on port ${port}`);
}

bootstrap();
