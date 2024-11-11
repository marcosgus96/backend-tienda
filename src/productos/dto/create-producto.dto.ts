import { IsNotEmpty, IsDecimal, IsString, IsInt, Min, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CreateProductoDto {
  @ApiProperty({ description: 'Nombre del producto' })
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @ApiProperty({ description: 'Descripción del producto' })
  @IsNotEmpty()
  @IsString()
  descripcion: string;

  @ApiProperty({ description: 'Precio del producto' })
  @IsNumber({ allowInfinity: false, allowNaN: false }, { message: 'El precio debe ser un número válido' })
  @IsNotEmpty({ message: 'El precio es obligatorio' })
  @Transform(({ value }) => parseFloat(value))
  precio: number;

  @ApiProperty({ description: 'URL de la imagen del producto' })
  @IsString()
  @IsOptional()
  imagen?: string;

  @ApiProperty({ description: 'ID de la categoría a la que pertenece el producto' })
  @IsNotEmpty()
  @IsInt()
  @Transform(({ value }) => parseInt(value))
  categoriaId: number;

  @ApiProperty({ description: 'Stock disponible del producto', example: 100 })
  @IsNotEmpty()
  @IsInt()
  @Min(0)
  @Transform(({ value }) => parseInt(value))
  stock: number;
}

