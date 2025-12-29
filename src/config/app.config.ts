import { INestApplication, ValidationPipe } from '@nestjs/common';
import { GlobalExceptionFilter } from '@common/exception-filters/exception.filter';
import { GlobalInterceptor } from '@common/interceptors/global.interceptor';

export function setupApp(app: INestApplication): void {
  // Global prefix
  app.setGlobalPrefix('wallet/v1');

  // CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || '*',
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global exception filter
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Global interceptor
  app.useGlobalInterceptors(new GlobalInterceptor());
}
