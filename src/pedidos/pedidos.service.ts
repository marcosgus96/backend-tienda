import { Injectable, NotFoundException, BadRequestException, Inject  } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Pedido, EstadoPedido } from './pedido.entity';
import { DetallePedido } from './detalle-pedido.entity';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { UsuariosService } from '../usuarios/usuarios.service';
import { ProductosService } from '../productos/productos.service';
// ... otras importaciones
import { Producto } from '../productos/producto.entity';
import { ClientProxy } from '@nestjs/microservices';


@Injectable()
export class PedidosService {
  constructor(
    @InjectRepository(Pedido)
    private pedidoRepository: Repository<Pedido>,
    @InjectRepository(DetallePedido)
    private detallePedidoRepository: Repository<DetallePedido>,
    private usuariosService: UsuariosService,
    private productosService: ProductosService,
    @Inject('NOTIFICACIONES_SERVICE') private readonly client: ClientProxy,
    @Inject('FACTURACION_SERVICE') private readonly clientD: ClientProxy,
  ) {
    this.client.connect();
  }

  async create(createPedidoDto: CreatePedidoDto, usuarioId: number): Promise<Pedido> {
    const usuario = await this.usuariosService.findOne(usuarioId);
    const pedido = new Pedido();
    pedido.usuario = usuario;
    pedido.estado = EstadoPedido.PENDIENTE;

    const detalles: DetallePedido[] = [];

    // Iniciar una transacción para asegurar la integridad de datos
    const queryRunner = this.pedidoRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      for (const detalleDto of createPedidoDto.detalles) {
        const producto = await queryRunner.manager
          .getRepository(Producto)
          .createQueryBuilder('producto')
          .setLock('pessimistic_write')
          .where('producto.id = :id', { id: detalleDto.productoId })
          .getOne();

        if (!producto) {
          throw new NotFoundException(`Producto con ID ${detalleDto.productoId} no encontrado`);
        }

        // Verificar stock
        if (producto.stock < detalleDto.cantidad) {
          throw new BadRequestException(
            `Stock insuficiente para el producto ${producto.nombre} (ID: ${producto.id})`,
          );
        }

        // Disminuir stock
        producto.stock -= detalleDto.cantidad;
        await queryRunner.manager.save(producto);

        const detalle = new DetallePedido();
        detalle.producto = producto;
        detalle.cantidad = detalleDto.cantidad;
        detalle.precioUnitario = producto.precio;
        detalles.push(detalle);
      }

      pedido.detalles = detalles;
      const nuevoPedido = await queryRunner.manager.save(pedido);
      const pedidoData = {
        idPedido: nuevoPedido.id,
        nombreCliente: nuevoPedido.usuario.username,
        emailCliente: nuevoPedido.usuario.email,
        fecha: nuevoPedido.fechaCreacion,
        detalles: nuevoPedido.detalles.map((detalle) => ({
          producto: detalle.producto.nombre,
          cantidad: detalle.cantidad,
          precioUnitario: detalle.precioUnitario,
          total: detalle.cantidad * detalle.precioUnitario,
        })),
        total: nuevoPedido.detalles.reduce(
          (sum, detalle) => sum + detalle.cantidad * detalle.precioUnitario,
          0,
        ),
      };
  
      this.clientD.emit('pedido_creado', pedidoData);
  

      await queryRunner.commitTransaction();
      return nuevoPedido;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }

    
  }

  async findAll(): Promise<Pedido[]> {
    return this.pedidoRepository.find({ relations: ['detalles', 'usuario'] });
  }

  async findByUsuario(usuarioId: number): Promise<Pedido[]> {
    return this.pedidoRepository.find({
      where: { usuario: { id: usuarioId } },
      relations: ['detalles', 'usuario'],
    });
  }

  async findOne(id: number): Promise<Pedido> {
    const pedido = await this.pedidoRepository.findOne({
      where: { id },
      relations: ['detalles', 'usuario'],
    });
    if (!pedido) {
      throw new NotFoundException(`Pedido con ID ${id} no encontrado`);
    }
    return pedido;
  }

  async updateEstado(id: number, estado: EstadoPedido): Promise<Pedido> {
    const pedido = await this.findOne(id);
    pedido.estado = estado;
    const pedidoActualizado = await this.pedidoRepository.save(pedido);

    // Obtener el email del usuario
    const emailUsuario = pedido.usuario.email;

    // Emitir evento al microservicio de notificaciones
    this.client.emit('pedido_actualizado', {
      emailUsuario,
      estadoPedido: estado,
      idPedido: pedido.id,
    });

    return pedidoActualizado;
  }
}
