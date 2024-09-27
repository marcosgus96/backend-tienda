import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
/*Esto permite que las validaciones se centren en los DTOs, manteniendo la entidad limpia 
y enfocada en la estructura de la base de datos. */
@Entity()
export class Producto {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column('decimal')
  precio: number;

  @Column()
  descripcion: string;

  @Column()
  imagen: string;

  @Column()
  categoria: string;
}

