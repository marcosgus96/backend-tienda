import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';//El ValidationPipe automáticamente valida las solicitudes entrantes basadas en las reglas definidas en nuestras entidades o DTOs (Data Transfer Objects)

async function bootstrap() {
  
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(3000);
}
bootstrap();
