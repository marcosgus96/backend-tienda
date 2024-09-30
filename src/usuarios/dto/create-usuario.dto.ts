import { IsNotEmpty, IsString, IsEmail, IsEnum } from 'class-validator';
import { Rol } from '../usuario.entity';

export class CreateUsuarioDto {
  @IsNotEmpty()
  @IsString()
  username: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsEnum(Rol)
  rol: Rol;
}
