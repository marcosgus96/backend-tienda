import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { IsNotEmpty, IsDecimal } from 'class-validator'; // decoradores de validación como @IsNotEmpty() y @IsDecimal() para asegurar que los campos esenciales no estén vacíos y que el precio sea un número decimal.

@Entity()
export class Producto {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @IsNotEmpty()
  nombre: string;

  @Column('decimal')
  @IsDecimal()
  precio: number;

  @Column()
  @IsNotEmpty()
  descripcion: string;

  @Column()
  @IsNotEmpty()
  imagen: string;

  @Column()
  @IsNotEmpty()
  categoria: string;
}
