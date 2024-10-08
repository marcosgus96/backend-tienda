import { PartialType } from '@nestjs/mapped-types';
import { CreateProductoDto } from './create-producto.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, Min } from 'class-validator';

export class UpdateProductoDto extends PartialType(CreateProductoDto) {
  @ApiPropertyOptional({ description: 'Nombre del producto' })
  nombre?: string;

  @ApiPropertyOptional({ description: 'Precio del producto' })
  precio?: number;

  @ApiPropertyOptional({ description: 'Descripción del producto' })
  descripcion?: string;

  @ApiPropertyOptional({ description: 'URL de la imagen del producto' })
  imagen?: string;

  @ApiPropertyOptional({ description: 'ID de la categoría a la que pertenece el producto' })
  categoriaId?: number;

  @ApiPropertyOptional({ description: 'Stock disponible del producto', example: 100 })
  @IsOptional()
  @IsInt()
  @Min(0)
  stock?: number;
}
