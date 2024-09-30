import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';//El ValidationPipe automáticamente valida las solicitudes entrantes basadas en las reglas definidas en nuestras entidades o DTOs (Data Transfer Objects)
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as dotenv from 'dotenv';
import { Transport } from '@nestjs/microservices';

async function bootstrap() {
  
  const app = await NestFactory.create(AppModule);
  app.connectMicroservice({
    transport: Transport.TCP,
  });
  app.useGlobalPipes(new ValidationPipe());
  /*http://localhost:3000/api para ver la documentación de tu API.*/
  const config = new DocumentBuilder()
  .setTitle('API de Tienda')
  .setDescription('Documentación de la API de la tienda')
  .setVersion('1.0')
  .addBearerAuth(
    {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
    },
    'access-token', // Este es el nombre que asignamos al esquema de seguridad
  )
  .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  dotenv.config();
  await app.startAllMicroservices();
  await app.listen(3000);
}
bootstrap();
