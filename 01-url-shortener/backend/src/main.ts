import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import helmet from 'helmet';
import cors from 'cors';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Security headers with helmet (configured to permit QR images / swagger)
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      contentSecurityPolicy: false,
    }),
  );

  // CORS
  app.use(
    cors({
      origin: true,
      credentials: true,
    }),
  );

  // Global prefixes and filters
  app.setGlobalPrefix('api/v1', {
    exclude: ['r/(.*)', 'qr/(.*)', 'health'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());

  // Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('Tradeo URL Shortener API')
    .setDescription('Production-ready link management, redirection, analytics, and QR engine API.')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 4000;
  await app.listen(port);
  logger.log(`URL Shortener backend service is listening on port ${port}`);
  logger.log(`OpenAPI Swagger documentation available at http://localhost:${port}/api/docs`);
}

bootstrap();
