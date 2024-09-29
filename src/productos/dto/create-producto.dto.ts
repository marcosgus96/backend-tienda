import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsDecimal, IsString, IsInt } from 'class-validator';

export class CreateProductoDto {
  @ApiProperty({ description: 'Nombre del producto' })
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

  @ApiProperty({ description: 'ID de la categoría a la que pertenece el producto' })
  @IsNotEmpty()
  @IsInt()
  categoriaId: number;
}

