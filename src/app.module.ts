import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductosModule } from './productos/productos.module';
import { CategoriasModule } from './categorias/categorias.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { AuthModule } from './auth/auth.module';
import { PedidosModule } from './pedidos/pedidos.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // Configuración de la base de datos
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost', // Cambia según tu configuración
      port: 5432, // Puerto por defecto
      username: 'postgres', // Tu usuario de PostgreSQL
      password: 'marcos', // Tu contraseña de PostgreSQL
      database: 'DB_tienda', // Nombre de tu base de datos
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    ProductosModule,
    CategoriasModule,
    UsuariosModule,
    AuthModule,
    PedidosModule,
  ],
})
export class AppModule {}
