import { IsOptional, IsString, IsNumber, Min, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

/*En este DTO definimos los posibles parámetros de consulta: categoria, nombre, precioMin, precioMax, pagina y limite.
 Utilizamos decoradores para validar y transformar los datos recibidos */
 export class GetProductosDto {
  @ApiPropertyOptional({ description: 'ID de la categoría', type: Number })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  categoriaId?: number;

  @ApiPropertyOptional({ description: 'Nombre del producto' })
  @IsOptional()
  @IsString()
  nombre?: string;

  @ApiPropertyOptional({ description: 'Precio mínimo', type: Number })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  precioMin?: number;

  @ApiPropertyOptional({ description: 'Precio máximo', type: Number })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  precioMax?: number;

  @ApiPropertyOptional({ description: 'Número de página', type: Number })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  pagina?: number;

  @ApiPropertyOptional({ description: 'Límite de resultados por página', type: Number })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limite?: number;
}
