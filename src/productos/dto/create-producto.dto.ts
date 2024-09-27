import { IsNotEmpty, IsDecimal, IsString } from 'class-validator';

export class CreateProductoDto {
  @IsNotEmpty()
  @IsString()
  nombre: string;

  @IsNotEmpty()
  @IsDecimal()
  precio: number;

  @IsNotEmpty()
  @IsString()
  descripcion: string;

  @IsNotEmpty()
  @IsString()
  imagen: string;

  @IsNotEmpty()
  @IsString()
  categoria: string;
}
