import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common'; // El ValidationPipe automáticamente valida las solicitudes entrantes basadas en las reglas definidas en nuestras entidades o DTOs (Data Transfer Objects)
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as dotenv from 'dotenv';
import { Transport } from '@nestjs/microservices';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Configurar CORS antes que nada
  app.enableCors({
    origin: 'http://localhost:3001', // Reemplaza con el origen de tu frontend
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Aplicar Pipes Globales
  app.useGlobalPipes(new ValidationPipe(
    {
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      skipMissingProperties: false,
      skipNullProperties: false,
      skipUndefinedProperties: false,
    }
  ));

  // Configurar Swagger
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

  // Configurar variables de entorno
  dotenv.config();

  // Conectar Microservicio
  //app.connectMicroservice({
    //transport: Transport.TCP,
  //});

  // Iniciar la aplicación y los microservicios
  //await app.startAllMicroservices();
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });
  await app.listen(3000);
}
bootstrap();
