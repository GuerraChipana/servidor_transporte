import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configuración de Swagger
  const config = new DocumentBuilder()
    .setTitle('Documentación de las APIS ')
    .setDescription(
      'Esta es la documentacion para el Sistema de Transporte con todos sus controladores',
    )
    .setVersion('1.0')
    .addTag('Auth')
    .addTag('Usuarios de Sistema')
    .addTag('Personas')
    .build();

  // Generación de la documentación
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('documentacion', app, document);

  // Uso de ValidationPipe globalmente
  app.useGlobalPipes(new ValidationPipe());

  // Escuchar el puerto 5000 en caso no se tenga el valor de PORT
  await app.listen(process.env.PORT || 5000);
}

bootstrap();
