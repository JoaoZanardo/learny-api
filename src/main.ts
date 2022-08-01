import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // app.useGlobalPipes(new ValidationPipe());
  app.use('/', express.static('C:/Users/User/Desktop/learny-api/public'));
  app.enableCors();
  await app.listen(3000);
}
bootstrap();
