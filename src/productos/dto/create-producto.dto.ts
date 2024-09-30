import { IsNotEmpty, IsDecimal, IsString, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductoDto {
  @ApiProperty({ description: 'Nombre del producto' })
  @IsNotEmpty()
  @IsString()
  nombre: string;

  @ApiProperty({ description: 'Precio del producto' })
  @IsNotEmpty()
  @IsDecimal()
  precio: number;

  @ApiProperty({ description: 'Descripción del producto' })
  @IsNotEmpty()
  @IsString()
  descripcion: string;

  @ApiProperty({ description: 'URL de la imagen del producto' })
  @IsNotEmpty()
  @IsString()
  imagen: string;

  @ApiProperty({ description: 'ID de la categoría a la que pertenece el producto' })
  @IsNotEmpty()
  @IsInt()
  categoriaId: number;

  @ApiProperty({ description: 'Stock disponible del producto', example: 100 })
  @IsNotEmpty()
  @IsInt()
  @Min(0)
  stock: number;
}

