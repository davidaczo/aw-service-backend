import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import { GlobalExceptionFilter } from './utils/filters/global-exception.filter';
import { ValidationFilter } from './utils/filters/validation.filter';
import { ValidationPipe } from './utils/pipes/validation.pipe';
import { configService } from './config/config.service';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useGlobalFilters(new GlobalExceptionFilter(), new ValidationFilter());
  app.useGlobalPipes(ValidationPipe);

  if (!configService.isProductionBuild()) {
    app.enableCors({
      origin: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      credentials: true,
    });
  } else {
    const allowedOrigins = configService.getAllowedOrigins() || [];
    app.enableCors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      credentials: true,
    });
  }
  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  const port = configService.getPort();
  const host = '0.0.0.0';

  await app.listen(port, host);
  console.log(`Server running on ${host}:${port} [${configService.getMode()}]`);
}
bootstrap();
