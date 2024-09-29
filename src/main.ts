import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';//El ValidationPipe automáticamente valida las solicitudes entrantes basadas en las reglas definidas en nuestras entidades o DTOs (Data Transfer Objects)
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  /*http://localhost:3000/api para ver la documentación de tu API.*/
  const config = new DocumentBuilder()
  .setTitle('API de Tienda')
  .setDescription('Documentación de la API de la tienda')
  .setVersion('1.0')
  .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  
  await app.listen(3000);
}
bootstrap();
