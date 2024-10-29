import { SetMetadata } from '@nestjs/common';
import { Rol } from '../user_sistemas/entities/user_sistema.entity'; // Asegúrate de que la ruta sea correcta

export const Roles = (...roles: Rol[]) => SetMetadata('roles', roles);
