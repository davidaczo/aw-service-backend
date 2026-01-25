import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configService } from './config/config.service';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import { GlobalExceptionFilter } from './utils/filters/global-exception.filter';
import { ValidationFilter } from './utils/filters/validation.filter';
import { ValidationPipe } from './utils/pipes/validation.pipe';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useGlobalFilters(new GlobalExceptionFilter(), new ValidationFilter());
  app.useGlobalPipes(ValidationPipe);
  app.useStaticAssets(join(__dirname, '..', 'public'));

  app.enableCors({
    origin: configService.getAllowedOrigins(),
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
  });

  await app.listen(configService.getPort());
}
bootstrap();
