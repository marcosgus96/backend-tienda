import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Producto } from './producto.entity';
/*En este servicio, utilizamos el repositorio de TypeORM para interactuar con la base de datos. 
Hemos implementado métodos para obtener todos los productos, obtener uno por ID, crear, actualizar y eliminar producto */

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
    return this.productoRepository.findOneBy({ id });
  }

  async create(producto: Producto): Promise<Producto> {
    return this.productoRepository.save(producto);
  }

  async update(id: number, producto: Producto): Promise<Producto> {
    await this.productoRepository.update(id, producto);
    return this.productoRepository.findOneBy({ id });
  }

  async remove(id: number): Promise<void> {
    await this.productoRepository.delete(id);
  }
}
