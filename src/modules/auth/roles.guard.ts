import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Rol } from '../user_sistemas/entities/user_sistema.entity';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // Obtener roles de la ruta
    const roles = this.reflector.get<Rol[]>('roles', context.getHandler());
    if (!roles) {
      return true; // No se requieren roles, acceso permitido
    }

    const user = request.user; // El usuario ya se estableció en JwtAuthGuard

    if (!user || !this.hasRole(user, roles)) {
      throw new ForbiddenException(
        'No tienes permisos para acceder a este recurso',
      );
    }

    return true; // Acceso permitido
  }

  private hasRole(user: any, roles: Rol[]): boolean {
    return roles.includes(user.rol); // Verifica si el rol del usuario está en la lista de roles permitidos
  }
}
