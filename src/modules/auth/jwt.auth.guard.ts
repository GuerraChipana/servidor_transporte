import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  // Método que determina si la solicitud puede ser procesada
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest(); // Objeto de la solicitud Http
    const token = request.headers.authorization?.split(' ')[1]; // Extrae el token del encabezado 'Authorization'

    // Validación q debe de existir el Token
    if (!token) {
      throw new UnauthorizedException('Token no proporcionado');
    }
    // Validación y decodificación del token
    try {
      const user = await this.jwtService.verifyAsync(token);
      request.user = user;
      return true; // Acceso permitido
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Token expirado');
      }
      throw new UnauthorizedException('Token inválido');
    }
  }
}
