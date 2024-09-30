import { Controller, Get, Post, Put, Param, Body, UseGuards, Request } from '@nestjs/common';
import { PedidosService } from './pedidos.service';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { Pedido, EstadoPedido } from './pedido.entity';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Rol } from '../usuarios/usuario.entity';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';

@ApiTags('pedidos')
@Controller('pedidos')
export class PedidosController {
  constructor(private readonly pedidosService: PedidosService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear un nuevo pedido' })
  @ApiBody({ type: CreatePedidoDto })
  @ApiResponse({ status: 201, description: 'Pedido creado exitosamente.', type: Pedido })
  async create(@Body() createPedidoDto: CreatePedidoDto, @Request() req): Promise<Pedido> {
    const usuarioId = req.user.id;
    return this.pedidosService.create(createPedidoDto, usuarioId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('mios')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener los pedidos del usuario autenticado' })
  @ApiResponse({ status: 200, description: 'Lista de pedidos del usuario obtenida correctamente.', type: [Pedido] })
  async findByUsuario(@Request() req): Promise<Pedido[]> {
    const usuarioId = req.user.id;
    return this.pedidosService.findByUsuario(usuarioId);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Rol.ADMIN)
  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener todos los pedidos (solo ADMIN)' })
  @ApiResponse({ status: 200, description: 'Lista de pedidos obtenida correctamente.', type: [Pedido] })
  async findAll(): Promise<Pedido[]> {
    return this.pedidosService.findAll();
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Rol.ADMIN)
  @Put(':id/estado')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar el estado de un pedido (solo ADMIN)' })
  @ApiParam({ name: 'id', description: 'ID del pedido', type: Number })
  @ApiBody({ schema: { type: 'object', properties: { estado: { type: 'string', enum: Object.values(EstadoPedido) } } } })
  @ApiResponse({ status: 200, description: 'Estado del pedido actualizado correctamente.', type: Pedido })
  async updateEstado(@Param('id') id: number, @Body('estado') estado: EstadoPedido): Promise<Pedido> {
    return this.pedidosService.updateEstado(id, estado);
  }
}
