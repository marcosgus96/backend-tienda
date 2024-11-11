import { Test, TestingModule } from '@nestjs/testing';
import { ProductosService } from './productos.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Producto } from './producto.entity';
import { Categoria } from '../categorias/categoria.entity';
import { Repository } from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('ProductosService', () => {
  let service: ProductosService;
  let productoRepository: Repository<Producto>;
  let categoriaRepository: Repository<Categoria>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductosService,
        {
          provide: getRepositoryToken(Producto),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Categoria),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<ProductosService>(ProductosService);
    productoRepository = module.get<Repository<Producto>>(getRepositoryToken(Producto));
    categoriaRepository = module.get<Repository<Categoria>>(getRepositoryToken(Categoria));
  });

  it('debe crear un producto exitosamente', async () => {
    const createProductoDto = {
      nombre: 'Producto Test',
      descripcion: 'Descripción del producto',
      precio: 99.99,
      categoriaId: 1,
      stock: 10,
      imagen: 'imagen.jpg',
    };
  
    const categoria = {
      id: 1,
      nombre: 'Categoría Test',
    };
  
    const nuevoProducto = {
      id: 1,
      ...createProductoDto,
      categoria: categoria,
    };
  
    jest.spyOn(categoriaRepository, 'findOneBy').mockResolvedValue(categoria as any);
    jest.spyOn(productoRepository, 'create').mockReturnValue(nuevoProducto as any);
    jest.spyOn(productoRepository, 'save').mockResolvedValue(nuevoProducto as any);
  
    const result = await service.create(createProductoDto);
  
    expect(result).toEqual(nuevoProducto);
    expect(categoriaRepository.findOneBy).toHaveBeenCalledWith({ id: createProductoDto.categoriaId });
    expect(productoRepository.create).toHaveBeenCalledWith({
      ...createProductoDto,
      categoria: categoria,
    });
    expect(productoRepository.save).toHaveBeenCalledWith(nuevoProducto);
  });

  it('debe lanzar una excepción al intentar crear un producto con una categoría no existente', async () => {
    const createProductoDto = {
      nombre: 'Producto Test',
      descripcion: 'Descripción del producto',
      precio: 99.99,
      categoriaId: 99, // Categoría que no existe
      stock: 10,
      imagen: 'imagen.jpg',
    };
  
    jest.spyOn(categoriaRepository, 'findOneBy').mockResolvedValue(null);
  
    await expect(service.create(createProductoDto)).rejects.toThrow(
      NotFoundException,
    );
  
    expect(categoriaRepository.findOneBy).toHaveBeenCalledWith({ id: createProductoDto.categoriaId });
  });

  it('debe retornar un producto por ID', async () => {
    const productoId = 1;
    const producto = {
      id: productoId,
      nombre: 'Producto Test',
      descripcion: 'Descripción del producto',
      precio: 99.99,
      categoria: { id: 1, nombre: 'Categoría Test' },
      stock: 10,
      imagen: 'imagen.jpg',
    };
  
    jest.spyOn(productoRepository, 'findOne').mockResolvedValue(producto as any);
  
    const result = await service.findOne(productoId);
  
    expect(result).toEqual(producto);
    expect(productoRepository.findOne).toHaveBeenCalledWith({
      where: { id: productoId },
      relations: ['categoria'],
    });
  });
  
  it('debe lanzar una excepción al no encontrar un producto', async () => {
    const productoId = 1;
  
    jest.spyOn(productoRepository, 'findOne').mockResolvedValue(null);
  
    await expect(service.findOne(productoId)).rejects.toThrow(
      NotFoundException,
    );
  
    expect(productoRepository.findOne).toHaveBeenCalledWith({
      where: { id: productoId },
      relations: ['categoria'],
    });
  });
  
  it('debe actualizar un producto exitosamente', async () => {
    const productoId = 1;
    const updateProductoDto = {
      nombre: 'Producto Actualizado',
      precio: 79.99,
      categoriaId: 2,
    };
  
    const productoExistente = {
      id: productoId,
      nombre: 'Producto Original',
      descripcion: 'Descripción original',
      precio: 99.99,
      categoria: { id: 1, nombre: 'Categoría Original' },
      stock: 10,
      imagen: 'imagen.jpg',
    };
  
    const nuevaCategoria = {
      id: 2,
      nombre: 'Categoría Nueva',
    };
  
    const productoActualizado = {
      ...productoExistente,
      ...updateProductoDto,
      categoria: nuevaCategoria,
    };
  
    jest.spyOn(service, 'findOne').mockResolvedValue(productoExistente as any);
    jest.spyOn(categoriaRepository, 'findOneBy').mockResolvedValue(nuevaCategoria as any);
    jest.spyOn(productoRepository, 'save').mockResolvedValue(productoActualizado as any);
  
    const result = await service.update(productoId, updateProductoDto);
  
    expect(result).toEqual(productoActualizado);
    expect(service.findOne).toHaveBeenCalledWith(productoId);
    expect(categoriaRepository.findOneBy).toHaveBeenCalledWith({ id: updateProductoDto.categoriaId });
    expect(productoRepository.save).toHaveBeenCalledWith(productoActualizado);
  });

  it('debe lanzar una excepción al intentar actualizar un producto no existente', async () => {
    const productoId = 1;
    const updateProductoDto = {
      nombre: 'Producto Actualizado',
      precio: 79.99,
    };
  
    jest.spyOn(service, 'findOne').mockRejectedValue(new NotFoundException('Producto no encontrado'));
  
    await expect(service.update(productoId, updateProductoDto)).rejects.toThrow('Producto no encontrado');
  
    expect(service.findOne).toHaveBeenCalledWith(productoId);
  });

  it('debe lanzar una excepción al intentar actualizar un producto con una categoría no existente', async () => {
    const productoId = 1;
    const updateProductoDto = {
      nombre: 'Producto Actualizado',
      precio: 79.99,
      categoriaId: 99, // Categoría que no existe
    };
  
    const productoExistente = {
      id: productoId,
      nombre: 'Producto Original',
      descripcion: 'Descripción original',
      precio: 99.99,
      categoria: { id: 1, nombre: 'Categoría Original' },
      stock: 10,
      imagen: 'imagen.jpg',
    };
  
    jest.spyOn(service, 'findOne').mockResolvedValue(productoExistente as any);
    jest.spyOn(categoriaRepository, 'findOneBy').mockResolvedValue(null);
  
    await expect(service.update(productoId, updateProductoDto)).rejects.toThrow(
      NotFoundException,
    );
  
    expect(service.findOne).toHaveBeenCalledWith(productoId);
    expect(categoriaRepository.findOneBy).toHaveBeenCalledWith({ id: updateProductoDto.categoriaId });
  });

  it('debe eliminar un producto exitosamente', async () => {
    const productoId = 1;
  
    const productoExistente = {
      id: productoId,
      nombre: 'Producto a Eliminar',
      categoria: { id: 1, nombre: 'Categoría' },
    };
  
    jest.spyOn(service, 'findOne').mockResolvedValue(productoExistente as any);
    jest.spyOn(productoRepository, 'delete').mockResolvedValue({ affected: 1 } as any);
  
    await service.remove(productoId);
  
    expect(service.findOne).toHaveBeenCalledWith(productoId);
    expect(productoRepository.delete).toHaveBeenCalledWith(productoId);
  });

  it('debe lanzar una excepción al intentar eliminar un producto no existente', async () => {
    const productoId = 1;
  
    jest.spyOn(service, 'findOne').mockRejectedValue(new NotFoundException('Producto no encontrado'));
  
    await expect(service.remove(productoId)).rejects.toThrow('Producto no encontrado');
  
    expect(service.findOne).toHaveBeenCalledWith(productoId);
  });

  it('debe disminuir el stock de un producto exitosamente', async () => {
    const productoId = 1;
    const cantidad = 5;
  
    const productoExistente = {
      id: productoId,
      nombre: 'Producto',
      stock: 10,
    };
  
    const productoActualizado = {
      ...productoExistente,
      stock: productoExistente.stock - cantidad,
    };
  
    jest.spyOn(productoRepository, 'findOneBy').mockResolvedValue(productoExistente as any);
    jest.spyOn(productoRepository, 'save').mockResolvedValue(productoActualizado as any);
  
    await service.disminuirStock(productoId, cantidad);
  
    expect(productoRepository.findOneBy).toHaveBeenCalledWith({ id: productoId });
    expect(productoRepository.save).toHaveBeenCalledWith(productoActualizado);
  });
  
  it('debe lanzar una excepción si el stock es insuficiente al disminuir stock', async () => {
    const productoId = 1;
    const cantidad = 15;
  
    const productoExistente = {
      id: productoId,
      nombre: 'Producto',
      stock: 10,
    };
  
    jest.spyOn(productoRepository, 'findOneBy').mockResolvedValue(productoExistente as any);
  
    await expect(service.disminuirStock(productoId, cantidad)).rejects.toThrow(BadRequestException);
  
    expect(productoRepository.findOneBy).toHaveBeenCalledWith({ id: productoId });
  });
  
  it('debe aumentar el stock de un producto exitosamente', async () => {
    const productoId = 1;
    const cantidad = 5;
  
    const productoExistente = {
      id: productoId,
      nombre: 'Producto',
      stock: 10,
    };
  
    const productoActualizado = {
      ...productoExistente,
      stock: productoExistente.stock + cantidad,
    };
  
    jest.spyOn(productoRepository, 'findOneBy').mockResolvedValue(productoExistente as any);
    jest.spyOn(productoRepository, 'save').mockResolvedValue(productoActualizado as any);
  
    await service.aumentarStock(productoId, cantidad);
  
    expect(productoRepository.findOneBy).toHaveBeenCalledWith({ id: productoId });
    expect(productoRepository.save).toHaveBeenCalledWith(productoActualizado);
  });
  
  it('debe retornar productos por categoría', async () => {
    const categoriaId = 1;
    const productos = [
      { id: 1, nombre: 'Producto 1', categoria: { id: categoriaId, nombre: 'Categoría Test' } },
      { id: 2, nombre: 'Producto 2', categoria: { id: categoriaId, nombre: 'Categoría Test' } },
    ];
  
    jest.spyOn(productoRepository, 'find').mockResolvedValue(productos as any);
  
    const result = await service.findByCategory(categoriaId);
  
    expect(result).toEqual(productos);
    expect(productoRepository.find).toHaveBeenCalledWith({
      where: { categoria: { id: categoriaId } },
      relations: ['categoria'],
    });
  });
  
  it('debe actualizar el stock de un producto exitosamente', async () => {
    const productoId = 1;
    const nuevoStock = 20;
  
    const productoExistente = {
      id: productoId,
      nombre: 'Producto',
      stock: 10,
    };
  
    const productoActualizado = {
      ...productoExistente,
      stock: nuevoStock,
    };
  
    jest.spyOn(productoRepository, 'findOne').mockResolvedValue(productoExistente as any);
    jest.spyOn(productoRepository, 'save').mockResolvedValue(productoActualizado as any);
  
    const result = await service.updateStock(productoId, nuevoStock);
  
    expect(result).toEqual(productoActualizado);
    expect(productoRepository.findOne).toHaveBeenCalledWith({ where: { id: productoId } });
    expect(productoRepository.save).toHaveBeenCalledWith(productoActualizado);
  });
  
  it('debe lanzar una excepción al intentar actualizar el stock a un valor negativo', async () => {
    const productoId = 1;
    const nuevoStock = -5;
  
    const productoExistente = {
      id: productoId,
      nombre: 'Producto',
      stock: 10,
    };
  
    jest.spyOn(productoRepository, 'findOne').mockResolvedValue(productoExistente as any);
  
    await expect(service.updateStock(productoId, nuevoStock)).rejects.toThrow(
      BadRequestException,
    );
  
    expect(productoRepository.findOne).toHaveBeenCalledWith({ where: { id: productoId } });
  });
  
  it('debe retornar una lista de productos', async () => {
    const productos = [
      { id: 1, nombre: 'Producto 1', categoria: { id: 1, nombre: 'Categoría 1' } },
      { id: 2, nombre: 'Producto 2', categoria: { id: 2, nombre: 'Categoría 2' } },
    ];
  
    const query = {
      pagina: 1,
      limite: 10,
    };
  
    // Mock del createQueryBuilder
    const mockQueryBuilder: any = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([productos, productos.length]),
    };
  
    jest.spyOn(productoRepository, 'createQueryBuilder').mockReturnValue(mockQueryBuilder);
  
    const result = await service.findAll(query);
  
    expect(result.data).toEqual(productos);
    expect(result.total).toEqual(productos.length);
    expect(result.pagina).toEqual(query.pagina);
    expect(result.lastPage).toEqual(1);
  });

  it('debe lanzar una excepción al intentar eliminar un producto con ID inválido', async () => {
    const productoId = 'abc'; // ID inválido
  
    await expect(service.remove(productoId as any)).rejects.toThrow();
  });

  it('debe lanzar una excepción al intentar disminuir el stock de un producto no existente', async () => {
    const productoId = 99; // ID de un producto que no existe
    const cantidad = 5;
  
    jest.spyOn(productoRepository, 'findOneBy').mockResolvedValue(null);
  
    await expect(service.disminuirStock(productoId, cantidad)).rejects.toThrow(
      NotFoundException,
    );
  
    expect(productoRepository.findOneBy).toHaveBeenCalledWith({ id: productoId });
  });
  

  it('debe lanzar una excepción al intentar aumentar el stock de un producto no existente', async () => {
    const productoId = 99; // ID de un producto que no existe
    const cantidad = 5;
  
    jest.spyOn(productoRepository, 'findOneBy').mockResolvedValue(null);
  
    await expect(service.aumentarStock(productoId, cantidad)).rejects.toThrow(
      NotFoundException,
    );
  
    expect(productoRepository.findOneBy).toHaveBeenCalledWith({ id: productoId });
  });
  
  it('debe lanzar una excepción al intentar actualizar un producto con datos inválidos', async () => {
    const productoId = 1;
    const updateProductoDto = {
      precio: -50, // Precio negativo (inválido)
    };
  
    const productoExistente = {
      id: productoId,
      nombre: 'Producto Original',
      descripcion: 'Descripción original',
      precio: 99.99,
      categoria: { id: 1, nombre: 'Categoría Original' },
      stock: 10,
      imagen: 'imagen.jpg',
    };
  
    jest.spyOn(service, 'findOne').mockResolvedValue(productoExistente as any);
  
    // Simulamos que el repositorio arroja un error al intentar guardar datos inválidos
    jest.spyOn(productoRepository, 'save').mockImplementation(() => {
      throw new BadRequestException('Precio inválido');
    });
  
    await expect(service.update(productoId, updateProductoDto)).rejects.toThrow(
      BadRequestException,
    );
  
    expect(service.findOne).toHaveBeenCalledWith(productoId);
    expect(productoRepository.save).toHaveBeenCalled();
  });
  
  it('debe lanzar una excepción al intentar crear un producto con datos inválidos', async () => {
    const createProductoDto = {
      nombre: '', // Nombre vacío (inválido)
      descripcion: 'Descripción del producto',
      precio: 99.99,
      categoriaId: 1,
      stock: -5, // Stock negativo (inválido)
      imagen: 'imagen.jpg',
    };
  
    const categoria = {
      id: 1,
      nombre: 'Categoría Test',
    };
  
    jest.spyOn(categoriaRepository, 'findOneBy').mockResolvedValue(categoria as any);
  
    // Simulamos que el repositorio arroja un error al intentar guardar datos inválidos
    jest.spyOn(productoRepository, 'save').mockImplementation(() => {
      throw new BadRequestException('Datos inválidos');
    });
  
    await expect(service.create(createProductoDto)).rejects.toThrow(
      BadRequestException,
    );
  
    expect(categoriaRepository.findOneBy).toHaveBeenCalledWith({ id: createProductoDto.categoriaId });
    expect(productoRepository.create).toHaveBeenCalled();
    expect(productoRepository.save).toHaveBeenCalled();
  });
  

  // Aquí irán las pruebas actualizadas
});
