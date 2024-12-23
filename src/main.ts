import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configuración de CORS para permitir solo dos orígenes específicos
  app.enableCors({
    origin: [
      'http://localhost:5173',
      'https://transportevehicular.munitai.gob.pe',
    ],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Uso de ValidationPipe globalmente
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  await app.listen(process.env.PORT);
}
bootstrap();
