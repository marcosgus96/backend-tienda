import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Pedido } from './pedido.entity';
import { Producto } from '../productos/producto.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class DetallePedido {
  @ApiProperty({ description: 'ID único del detalle del pedido' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Pedido al que pertenece el detalle', type: () => Pedido })
  @ManyToOne(() => Pedido, (pedido) => pedido.detalles)
  pedido: Pedido;

  @ApiProperty({ description: 'Producto incluido en el detalle', type: () => Producto })
  @ManyToOne(() => Producto, { eager: true })
  producto: Producto;

  @ApiProperty({ description: 'Cantidad solicitada del producto', example: 2 })
  @Column()
  cantidad: number;

  @ApiProperty({ description: 'Precio unitario del producto al momento del pedido', example: 99.99 })
  @Column('decimal')
  precioUnitario: number;
}
