import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import * as request from 'supertest';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Producto } from '../src/productos/producto.entity';
import { Categoria } from '../src/categorias/categoria.entity';

describe('ProductosController (e2e)', () => {
  let app: INestApplication;
  let productoRepository: Repository<Producto>;
  let categoriaRepository: Repository<Categoria>;
  let server: any;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    productoRepository = moduleFixture.get<Repository<Producto>>(getRepositoryToken(Producto));
    categoriaRepository = moduleFixture.get<Repository<Categoria>>(getRepositoryToken(Categoria));

    app = moduleFixture.createNestApplication();

    // Aplicar pipes globales si los usas en tu aplicación
    app.useGlobalPipes(new ValidationPipe({
      transform: true,
      whitelist: true,
    }));

    await app.init();
    server = app.getHttpServer();
  });

  afterAll(async () => {
    await app.close();
  });

  // Aquí irán las pruebas

  it('/productos (POST) debe crear un producto', async () => {
    // Primero, necesitamos una categoría para asignar al producto
    const categoria = await categoriaRepository.save({
      nombre: 'Categoría de Prueba',
    });
  
    const response = await request(server)
      .post('/productos')
      .field('nombre', 'Producto Test')
      .field('descripcion', 'Descripción del producto')
      .field('precio', '99.99')
      .field('categoriaId', categoria.id.toString())
      .field('stock', '10')
      .attach('imagen', 'test/fixtures/imagen.jpg') // Asegúrate de que la imagen existe en esta ruta
      .expect(201);
  
    expect(response.body).toHaveProperty('id');
    expect(response.body.nombre).toBe('Producto Test');
    expect(response.body.categoria.id).toBe(categoria.id);
  });

  it('/productos (GET) debe retornar una lista de productos', async () => {
    const response = await request(server)
      .get('/productos')
      .expect(200);
  
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.total).toBeGreaterThanOrEqual(1);
  });

  it('/productos/:id (GET) debe retornar un producto por ID', async () => {
    // Obtenemos un producto existente
    const producto = await productoRepository.findOne({ where: {} });
  if (!producto) {
    throw new Error('No hay productos en la base de datos');
  }
  
    const response = await request(server)
      .get(`/productos/${producto.id}`)
      .expect(200);
  
    expect(response.body).toHaveProperty('id', producto.id);
    expect(response.body.nombre).toBe(producto.nombre);
  });

  it('/productos/:id (PUT) debe actualizar un producto', async () => {
    const producto = await productoRepository.findOne({ where: {} });
  if (!producto) {
    throw new Error('No hay productos en la base de datos');
  }
  
    const nuevoNombre = 'Producto Actualizado';
  
    const response = await request(server)
      .put(`/productos/${producto.id}`)
      .field('nombre', nuevoNombre)
      .expect(200);
  
    expect(response.body.nombre).toBe(nuevoNombre);
  });

  it('/productos/:id (DELETE) debe eliminar un producto', async () => {
    const producto = await productoRepository.findOne({ where: {} });
  if (!producto) {
    throw new Error('No hay productos en la base de datos');
  }
  
    await request(server)
      .delete(`/productos/${producto.id}`)
      .expect(200);
  
    const productoEliminado = await productoRepository.findOne({ where: { id: producto.id } });
    expect(productoEliminado).toBeUndefined();
  });

  it('/productos/:id (GET) debe retornar 404 si el producto no existe', async () => {
    const productoId = 9999; // ID que probablemente no exista
  
    const response = await request(server)
      .get(`/productos/${productoId}`)
      .expect(404);
  
    expect(response.body.message).toContain('Producto con ID');
  });

  it('/productos (POST) debe retornar 400 al crear un producto con datos inválidos', async () => {
    const response = await request(server)
      .post('/productos')
      .field('nombre', '') // Nombre vacío (inválido)
      .field('precio', '-10') // Precio negativo (inválido)
      .expect(400);
  
    expect(response.body.message).toBeInstanceOf(Array);
  });
  
  it('/productos/disminuir-stock/:id (PATCH) debe disminuir el stock de un producto', async () => {
    const producto = await productoRepository.save({
      nombre: 'Producto para Disminuir Stock',
      descripcion: 'Descripción',
      precio: 50,
      stock: 20,
      imagen: 'imagen.jpg',
      categoria: await categoriaRepository.findOne({ where: {} }),
    });
  
    const cantidadADisminuir = 5;
  
    const response = await request(server)
      .patch(`/productos/disminuir-stock/${producto.id}`)
      .send({ cantidad: cantidadADisminuir })
      .expect(200);
  
    expect(response.body.stock).toBe(producto.stock - cantidadADisminuir);
  });
  
  it('/productos/disminuir-stock/:id (PATCH) debe retornar 400 si el stock es insuficiente', async () => {
    const producto = await productoRepository.save({
      nombre: 'Producto con Stock Limitado',
      descripcion: 'Descripción',
      precio: 50,
      stock: 2,
      imagen: 'imagen.jpg',
      categoria: await categoriaRepository.findOne({ where: {} }),
    });
  
    const cantidadADisminuir = 5;
  
    const response = await request(server)
      .patch(`/productos/disminuir-stock/${producto.id}`)
      .send({ cantidad: cantidadADisminuir })
      .expect(400);
  
    expect(response.body.message).toContain('Stock insuficiente');
  });
  
  it('/productos/categoria/:id (GET) debe retornar productos por categoría', async () => {
    const categoria = await categoriaRepository.save({
      nombre: 'Categoría para Filtrar',
    });
  
    const producto1 = await productoRepository.save({
      nombre: 'Producto 1',
      descripcion: 'Descripción',
      precio: 30,
      stock: 10,
      imagen: 'imagen.jpg',
      categoria: categoria,
    });
  
    const producto2 = await productoRepository.save({
      nombre: 'Producto 2',
      descripcion: 'Descripción',
      precio: 40,
      stock: 15,
      imagen: 'imagen.jpg',
      categoria: categoria,
    });
  
    const response = await request(server)
      .get(`/productos/categoria/${categoria.id}`)
      .expect(200);
  
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(2);
    expect(response.body[0].categoria.id).toBe(categoria.id);
    expect(response.body[1].categoria.id).toBe(categoria.id);
  });
  
  
  
  
});
