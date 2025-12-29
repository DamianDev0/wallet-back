import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { setupApp } from './config/app.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT || 8080;

  setupApp(app);

  await app.listen(port);

  const logger = new Logger('Bootstrap');
  logger.log(
    `Application is running on: http://localhost:${port}/wallet/v1`,
  );
  logger.log(`Swagger documentation: http://localhost:${port}/api`);
  logger.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
}

bootstrap();
