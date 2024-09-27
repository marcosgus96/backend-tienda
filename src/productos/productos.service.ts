import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Producto } from './producto.entity';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
/*En el método create, utilizamos this.productoRepository.create(createProductoDto) para crear una nueva 
instancia de Producto a partir del DTO. En el método update, primero obtenemos el producto existente, 
luego utilizamos Object.assign para actualizar sus propiedades con los valores del DTO, y finalmente guardamos los cambios. */

@Injectable()
export class ProductosService {
  constructor(
    @InjectRepository(Producto)
    private productoRepository: Repository<Producto>,
  ) {}

  async findAll(): Promise<Producto[]> {
    return this.productoRepository.find();
  }

  async findOne(id: number): Promise<Producto> {
    const producto = await this.productoRepository.findOneBy({ id });
    if (!producto) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    }
    return producto;
  }

  async create(createProductoDto: CreateProductoDto): Promise<Producto> {
    const nuevoProducto = this.productoRepository.create(createProductoDto);
    return this.productoRepository.save(nuevoProducto);
  }

  async update(id: number, updateProductoDto: UpdateProductoDto): Promise<Producto> {
    const producto = await this.findOne(id);
    const productoActualizado = Object.assign(producto, updateProductoDto);
    return this.productoRepository.save(productoActualizado);
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.productoRepository.delete(id);
  }
}

