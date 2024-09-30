import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { OneToMany } from 'typeorm';
import { Pedido } from '../pedidos/pedido.entity';

export enum Rol {
  ADMIN = 'ADMIN',
  USUARIO = 'USUARIO',
}

@Entity()
export class Usuario {
  @ApiProperty({ description: 'ID del usuario' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Nombre de usuario' })
  @Column({ unique: true })
  username: string;

  @ApiProperty({ description: 'Contraseña del usuario' })
  @Column()
  password: string;

  @ApiProperty({ description: 'Correo electrónico del usuario' })
  @Column({ unique: true })
  email: string;

  @ApiProperty({ description: 'Rol del usuario', enum: Rol })
  @Column({
    type: 'enum',
    enum: Rol,
    default: Rol.USUARIO,
  })
  rol: Rol;

  @OneToMany(() => Pedido, (pedido) => pedido.usuario)
  pedidos: Pedido[];
}
