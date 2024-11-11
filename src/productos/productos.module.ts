import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductosService } from './productos.service';
import { ProductosController } from './productos.controller';
import { Producto } from './producto.entity';
import { Categoria } from '../categorias/categoria.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Producto, Categoria])], //TypeOrmMoudle registra la entidad para que esté disponible en el módulo y pueda ser inyectada en los servicio
  controllers: [ProductosController],
  providers: [ProductosService],
  exports: [ProductosService], // Exportamos el servicio aquí
})
export class ProductosModule {}
