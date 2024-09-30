import { Injectable } from '@nestjs/common';
import { UsuariosService } from '../usuarios/usuarios.service';
import * as bcrypt from 'bcrypt';
import { Usuario } from '../usuarios/usuario.entity';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private usuariosService: UsuariosService, private jwtService: JwtService,) {}

  async validateUser(username: string, password: string): Promise<Usuario> {
    const user = await this.usuariosService.findByUsername(username);
    if (user && (await bcrypt.compare(password, user.password))) {
      return user;
    }
    return null;
  }

  // Agregar método para generar el token
  async login(user: Usuario) {
    const payload = { username: user.username, sub: user.id, rol: user.rol };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
