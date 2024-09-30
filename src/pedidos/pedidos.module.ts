import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PedidosService } from './pedidos.service';
import { PedidosController } from './pedidos.controller';
import { Pedido } from './pedido.entity';
import { DetallePedido } from './detalle-pedido.entity';
import { UsuariosModule } from '../usuarios/usuarios.module';
import { ProductosModule } from 'src/productos/productos.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Pedido, DetallePedido]),
    UsuariosModule,
    ProductosModule
  ],
  controllers: [PedidosController],
  providers: [PedidosService],
})
export class PedidosModule {}

