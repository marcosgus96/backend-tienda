import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Usuario } from './usuario.entity';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private usuarioRepository: Repository<Usuario>,
  ) {}

  async findAll(): Promise<Usuario[]> {
    return this.usuarioRepository.find();
  }

  async findOne(id: number): Promise<Usuario> {
    const usuario = await this.usuarioRepository.findOneBy({ id });
    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }
    return usuario;
  }

  async findByUsername(username: string): Promise<Usuario> {
    return this.usuarioRepository.findOneBy({ username });
  }

 // En el método create:

async create(createUsuarioDto: CreateUsuarioDto): Promise<Usuario> {
    const { password, ...usuarioData } = createUsuarioDto;
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);
  
    const nuevoUsuario = this.usuarioRepository.create({
      ...usuarioData,
      password: hashedPassword,
    });
    return this.usuarioRepository.save(nuevoUsuario);
  }

  // En el método update (si se permite actualizar la contraseña):

async update(id: number, updateUsuarioDto: UpdateUsuarioDto): Promise<Usuario> {
    const usuario = await this.findOne(id);
  
    if (updateUsuarioDto.password) {
      const salt = await bcrypt.genSalt();
      updateUsuarioDto.password = await bcrypt.hash(updateUsuarioDto.password, salt);
    }
  
    const usuarioActualizado = Object.assign(usuario, updateUsuarioDto);
    return this.usuarioRepository.save(usuarioActualizado);
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.usuarioRepository.delete(id);
  }
}
