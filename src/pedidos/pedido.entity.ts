import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, CreateDateColumn } from 'typeorm';
import { Usuario } from '../usuarios/usuario.entity';
import { Producto } from '../productos/producto.entity';
import { DetallePedido } from './detalle-pedido.entity';
import { ApiProperty } from '@nestjs/swagger';

export enum EstadoPedido {
  PENDIENTE = 'PENDIENTE',
  APROBADO = 'APROBADO',
  ENVIADO = 'ENVIADO',
  ENTREGADO = 'ENTREGADO',
  CANCELADO = 'CANCELADO',
}

@Entity()
export class Pedido {
  @ApiProperty({ description: 'ID único del pedido' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Usuario que realizó el pedido', type: () => Usuario })
  @ManyToOne(() => Usuario, (usuario) => usuario.pedidos, { eager: true })
  usuario: Usuario;

  @ApiProperty({ description: 'Fecha y hora de creación del pedido' })
  @CreateDateColumn()
  fechaCreacion: Date;

  @ApiProperty({ description: 'Estado actual del pedido', enum: EstadoPedido })
  @Column({
    type: 'enum',
    enum: EstadoPedido,
    default: EstadoPedido.PENDIENTE,
  })
  estado: EstadoPedido;

  @ApiProperty({ description: 'Lista de detalles del pedido', type: () => [DetallePedido] })
  @OneToMany(() => DetallePedido, (detalle) => detalle.pedido, { cascade: true })
  detalles: DetallePedido[];

}
