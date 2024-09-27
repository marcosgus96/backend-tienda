import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { ProductosService } from './productos.service';
import { Producto } from './producto.entity';

/*Este controlador expone las rutas(metodos http) para manejar operaciones CRUD (Crear, Leer, Actualizar, Eliminar) sobre los productos.*/
@Controller('productos')
export class ProductosController {
  constructor(private readonly productosService: ProductosService) {}

  @Get()
  async findAll(): Promise<Producto[]> {
    return this.productosService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<Producto> {
    return this.productosService.findOne(id);
  }

  @Post()
  async create(@Body() producto: Producto): Promise<Producto> {
    return this.productosService.create(producto);
  }

  @Put(':id')
  async update(@Param('id') id: number, @Body() producto: Producto): Promise<Producto> {
    return this.productosService.update(id, producto);
  }

  @Delete(':id')
  async remove(@Param('id') id: number): Promise<void> {
    return this.productosService.remove(id);
  }
}
