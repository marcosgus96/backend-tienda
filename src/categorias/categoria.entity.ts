import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Producto } from '../productos/producto.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Categoria {
  @ApiProperty({ description: 'ID de la categoría' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Nombre de la categoría' })
  @Column({ unique: true })
  nombre: string;

  @ApiProperty({ description: 'Productos pertenecientes a la categoría', type: () => [Producto] })
  @OneToMany(() => Producto, (producto) => producto.categoria)
  productos: Producto[];
}
