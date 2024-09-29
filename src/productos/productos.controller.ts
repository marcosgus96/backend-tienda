import { Controller, Get, Post, Put, Delete, Param, Body, Query } from '@nestjs/common';
import { ProductosService } from './productos.service';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { GetProductosDto } from './dto/get-productos.dto';
import { Producto } from './producto.entity';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiQuery } from '@nestjs/swagger';

@ApiTags('productos')
@Controller('productos')
export class ProductosController {
  constructor(private readonly productosService: ProductosService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todos los productos' })
  @ApiQuery({ name: 'categoriaId', required: false, description: 'ID de la categoría', type: Number })
  @ApiQuery({ name: 'nombre', required: false, description: 'Nombre del producto' })
  @ApiQuery({ name: 'precioMin', required: false, description: 'Precio mínimo', type: Number })
  @ApiQuery({ name: 'precioMax', required: false, description: 'Precio máximo', type: Number })
  @ApiQuery({ name: 'pagina', required: false, description: 'Número de página', type: Number })
  @ApiQuery({ name: 'limite', required: false, description: 'Límite de resultados por página', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Lista de productos obtenida correctamente.',
    schema: {
      type: 'object',
      properties: {
        data: { type: 'array', items: { $ref: '#/components/schemas/Producto' } },
        total: { type: 'number' },
        pagina: { type: 'number' },
        lastPage: { type: 'number' },
      },
    },
  })
  async findAll(@Query() query: GetProductosDto): Promise<{ data: Producto[]; total: number }> {
    return this.productosService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un producto por ID' })
  @ApiParam({ name: 'id', description: 'ID del producto', type: Number })
  @ApiResponse({ status: 200, description: 'Producto obtenido correctamente.', type: Producto })
  @ApiResponse({ status: 404, description: 'Producto no encontrado.' })
  async findOne(@Param('id') id: number): Promise<Producto> {
    return this.productosService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo producto' })
  @ApiBody({ type: CreateProductoDto })
  @ApiResponse({ status: 201, description: 'Producto creado exitosamente.', type: Producto })
  async create(@Body() createProductoDto: CreateProductoDto): Promise<Producto> {
    return this.productosService.create(createProductoDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar un producto existente' })
  @ApiParam({ name: 'id', description: 'ID del producto', type: Number })
  @ApiBody({ type: UpdateProductoDto })
  @ApiResponse({ status: 200, description: 'Producto actualizado exitosamente.', type: Producto })
  @ApiResponse({ status: 404, description: 'Producto no encontrado.' })
  async update(
    @Param('id') id: number,
    @Body() updateProductoDto: UpdateProductoDto,
  ): Promise<Producto> {
    return this.productosService.update(id, updateProductoDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un producto' })
  @ApiParam({ name: 'id', description: 'ID del producto', type: Number })
  @ApiResponse({ status: 200, description: 'Producto eliminado exitosamente.' })
  @ApiResponse({ status: 404, description: 'Producto no encontrado.' })
  async remove(@Param('id') id: number): Promise<void> {
    return this.productosService.remove(id);
  }
}

