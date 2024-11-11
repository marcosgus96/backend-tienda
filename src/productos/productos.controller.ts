import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseInterceptors, UploadedFile, NotFoundException, Patch } from '@nestjs/common';
import { ProductosService } from './productos.service';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { GetProductosDto } from './dto/get-productos.dto';
import { Producto } from './producto.entity';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Rol } from '../usuarios/usuario.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerOptions } from '../config/multer.config';
import { Express } from 'express';

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
    console.log('Emitiendo evento al controlador');
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

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Rol.ADMIN)
  @Post()
  @UseInterceptors(FileInterceptor('imagen', multerOptions))
  @ApiOperation({ summary: 'Crear un nuevo producto' })
  @ApiBody({ type: CreateProductoDto })
  @ApiResponse({ status: 201, description: 'Producto creado exitosamente.', type: Producto })
  async create(@UploadedFile() file: Express.Multer.File, @Body() body: any) {
    const createProductoDto = new CreateProductoDto();
    createProductoDto.nombre = body.nombre;
    createProductoDto.descripcion = body.descripcion;
    createProductoDto.precio = parseFloat(body.precio);
    createProductoDto.categoriaId = parseInt(body.categoriaId);
    createProductoDto.stock = parseInt(body.stock);
    console.log('Archivo recibido:', file);
    console.log('Datos recibidos:', createProductoDto);
    
    if (file) {
      createProductoDto.imagen = file.filename;
    }
    return this.productosService.create(createProductoDto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Rol.ADMIN)
  @Put(':id')
  @UseInterceptors(FileInterceptor('imagen', multerOptions))
  @ApiOperation({ summary: 'Actualizar un producto existente' })
  @ApiParam({ name: 'id', description: 'ID del producto', type: Number })
  @ApiBody({ type: UpdateProductoDto })
  @ApiResponse({ status: 200, description: 'Producto actualizado exitosamente.', type: Producto })
  @ApiResponse({ status: 404, description: 'Producto no encontrado.' })
  async update(
    @Param('id') id: number,
    @UploadedFile() file: Express.Multer.File,
    @Body() updateProductoDto: UpdateProductoDto,
  ): Promise<Producto> {
    const productoActual = await this.productosService.findOne(+id);
    if (!productoActual) {
      throw new NotFoundException('Producto no encontrado');
    }
    // Si se sube una nueva imagen, actualizar el campo 'imagen'
    if (file) {
      updateProductoDto.imagen = file.filename;
      // Opcional: Eliminar la imagen anterior del servidor
      // Código para eliminar la imagen anterior...
    } else {
      // Si no se sube una nueva imagen, mantener la imagen existente
      updateProductoDto.imagen = productoActual.imagen;
    }

    // Actualizar el producto
    return this.productosService.update(+id, updateProductoDto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Rol.ADMIN)
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un producto' })
  @ApiParam({ name: 'id', description: 'ID del producto', type: Number })
  @ApiResponse({ status: 200, description: 'Producto eliminado exitosamente.' })
  @ApiResponse({ status: 404, description: 'Producto no encontrado.' })
  async remove(@Param('id') id: number): Promise<void> {
    return this.productosService.remove(id);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Rol.ADMIN)
  @Patch(':id/stock')
  async updateStock(
    @Param('id') id: string,
    @Body('stock') nuevoStock: number,
  ) {
    return this.productosService.updateStock(+id, nuevoStock);
  }
}

