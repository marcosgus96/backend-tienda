import { SetMetadata } from '@nestjs/common';
import { Rol } from '../usuarios/usuario.entity';

export const Roles = (...roles: Rol[]) => SetMetadata('roles', roles);
