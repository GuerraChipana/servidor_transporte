import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as dotenv from 'dotenv';
dotenv.config();  // Carga las variables de entorno

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Habilitar CORS si es necesario
  app.enableCors();

  // Configuración de Swagger
  const config = new DocumentBuilder()
    .setTitle('Documentación de las APIs')
    .setDescription(
      'Esta es la documentación para el Sistema de Transporte con todos sus controladores',
    )
    .setVersion('1.0')
    .addTag('Login')
    .addTag('Endpoints de Usuarios de Sistemas')
    .addTag('Endpoints de Personas')
    .addTag('Endpoints de Seguro vehicular')
    .addTag('Endpoints para vehiculos')
    .addTag('Endpoints de Conductores')
    .addTag('Endpoints de Aseguradoras')
    .addTag('Endpoints de Asociaciones')
    .addTag('Endpoints de Empadronamiento')
    .build();

  // Generación de la documentación
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('documentacion', app, document);

  // Uso de ValidationPipe globalmente
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Escucha el puerto 5000 en caso no se tenga el valor de PORT
  await app.listen(process.env.PORT || 5000);
}

bootstrap();
