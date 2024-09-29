import { Entity, Column, PrimaryGeneratedColumn, Index, ManyToOne } from 'typeorm';
import { Categoria } from '../categorias/categoria.entity';
import { ApiProperty } from '@nestjs/swagger';
/*Esto permite que las validaciones se centren en los DTOs, manteniendo la entidad limpia 
y enfocada en la estructura de la base de datos. */
@Entity()
export class Producto {
  @ApiProperty({ description: 'ID del producto' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Nombre del producto' })
  @Column()
  nombre: string;

  @ApiProperty({ description: 'Precio del producto' })
  @Column('decimal')
  precio: number;

  @ApiProperty({ description: 'Descripción del producto' })
  @Column()
  descripcion: string;

  @ApiProperty({ description: 'URL de la imagen del producto' })
  @Column()
  imagen: string;

  @ApiProperty({ description: 'Categoría a la que pertenece el producto', type: () => Categoria })
  @ManyToOne(() => Categoria, (categoria) => categoria.productos, { eager: true })
  categoria: Categoria;
}
