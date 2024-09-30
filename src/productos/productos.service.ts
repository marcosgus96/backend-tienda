import { Injectable, NotFoundException, BadRequestException  } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, FindOptionsWhere, Like, Repository } from 'typeorm';

import { Producto } from './producto.entity';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { GetProductosDto } from './dto/get-productos.dto';
import { Categoria } from 'src/categorias/categoria.entity';
/*En el método create, utilizamos this.productoRepository.create(createProductoDto) para crear una nueva 
instancia de Producto a partir del DTO. En el método update, primero obtenemos el producto existente, 
luego utilizamos Object.assign para actualizar sus propiedades con los valores del DTO, y finalmente guardamos los cambios. */

@Injectable()
export class ProductosService {
  constructor(
    @InjectRepository(Producto)
    private productoRepository: Repository<Producto>,
    @InjectRepository(Categoria)
    private categoriaRepository: Repository<Categoria>,
  ) {}

  async findAll(query: GetProductosDto): Promise<{ data: Producto[]; total: number; pagina: number; lastPage: number }> {
    const {
      categoriaId,
      nombre,
      precioMin,
      precioMax,
      pagina = 1,
      limite = 10,
    } = query;
  
    const where: any = {};
  
    if (nombre) {
      where.nombre = Like(`%${nombre}%`);
    }
  
    if (precioMin !== undefined && precioMax !== undefined) {
      where.precio = Between(precioMin, precioMax);
    } else if (precioMin !== undefined) {
      where.precio = Between(precioMin, Number.MAX_SAFE_INTEGER);
    } else if (precioMax !== undefined) {
      where.precio = Between(0, precioMax);
    }
  
    const skip = (pagina - 1) * limite;
  
    const queryBuilder = this.productoRepository.createQueryBuilder('producto')
      .leftJoinAndSelect('producto.categoria', 'categoria')
      .where(where)
      .skip(skip)
      .take(limite);
  
    if (categoriaId) {
      queryBuilder.andWhere('categoria.id = :categoriaId', { categoriaId });
    }
  
    const [data, total] = await queryBuilder.getManyAndCount();
  
    const lastPage = Math.ceil(total / limite);
  
    return { data, total, pagina, lastPage };
  }

  async findOne(id: number): Promise<Producto> {
    const producto = await this.productoRepository.findOne({
      where: { id },
      relations: ['categoria'],
    });
    if (!producto) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    }
    return producto;
  }

  async create(createProductoDto: CreateProductoDto): Promise<Producto> {
    const { categoriaId, ...productoData } = createProductoDto;
    const categoria = await this.categoriaRepository.findOneBy({ id: categoriaId });
    if (!categoria) {
      throw new NotFoundException(`Categoría con ID ${categoriaId} no encontrada`);
    }

    const nuevoProducto = this.productoRepository.create({
      ...productoData,
      categoria,
    });
    return this.productoRepository.save(nuevoProducto);
  }

  async update(id: number, updateProductoDto: UpdateProductoDto): Promise<Producto> {
    const producto = await this.findOne(id);

    if (updateProductoDto.categoriaId) {
      const categoria = await this.categoriaRepository.findOneBy({ id: updateProductoDto.categoriaId });
      if (!categoria) {
        throw new NotFoundException(`Categoría con ID ${updateProductoDto.categoriaId} no encontrada`);
      }
      producto.categoria = categoria;
    }

    const productoActualizado = Object.assign(producto, updateProductoDto);
    return this.productoRepository.save(productoActualizado);
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.productoRepository.delete(id);
  }

  // Método para disminuir el stock de un producto
  async disminuirStock(productoId: number, cantidad: number): Promise<void> {
    const producto = await this.productoRepository.findOneBy({ id: productoId });
    if (!producto) {
      throw new NotFoundException(`Producto con ID ${productoId} no encontrado`);
    }

    if (producto.stock < cantidad) {
      throw new BadRequestException(`Stock insuficiente para el producto con ID ${productoId}`);
    }

    producto.stock -= cantidad;
    await this.productoRepository.save(producto);
  }

  // Método para aumentar el stock de un producto (opcional, por si se necesita)
  async aumentarStock(productoId: number, cantidad: number): Promise<void> {
    const producto = await this.productoRepository.findOneBy({ id: productoId });
    if (!producto) {
      throw new NotFoundException(`Producto con ID ${productoId} no encontrado`);
    }

    producto.stock += cantidad;
    await this.productoRepository.save(producto);
  }
}

