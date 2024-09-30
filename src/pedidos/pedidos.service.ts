import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Pedido, EstadoPedido } from './pedido.entity';
import { DetallePedido } from './detalle-pedido.entity';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { UsuariosService } from '../usuarios/usuarios.service';
import { ProductosService } from '../productos/productos.service';

@Injectable()
export class PedidosService {
  constructor(
    @InjectRepository(Pedido)
    private pedidoRepository: Repository<Pedido>,
    @InjectRepository(DetallePedido)
    private detallePedidoRepository: Repository<DetallePedido>,
    private usuariosService: UsuariosService,
    private productosService: ProductosService,
  ) {}

  async create(createPedidoDto: CreatePedidoDto, usuarioId: number): Promise<Pedido> {
    const usuario = await this.usuariosService.findOne(usuarioId);
    const pedido = new Pedido();
    pedido.usuario = usuario;
    pedido.estado = EstadoPedido.PENDIENTE;

    const detalles: DetallePedido[] = [];

    for (const detalleDto of createPedidoDto.detalles) {
      const producto = await this.productosService.findOne(detalleDto.productoId);

      const detalle = new DetallePedido();
      detalle.producto = producto;
      detalle.cantidad = detalleDto.cantidad;
      detalle.precioUnitario = producto.precio;
      detalles.push(detalle);
    }

    pedido.detalles = detalles;

    return this.pedidoRepository.save(pedido);
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
    return this.pedidoRepository.save(pedido);
  }
}
