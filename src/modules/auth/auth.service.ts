import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { UserSistema } from '../user_sistemas/entities/user_sistema.entity';
import { time } from 'console';

@Injectable() // Decorador que indica que esta clase es un servicio
export class AuthService {
  constructor(
    private readonly jwtService: JwtService, // Inyección del servicio de JWT
    @InjectRepository(UserSistema) // Inyección del repositorio de la entidad UserSistema
    private readonly userSistemaRepository: Repository<UserSistema>, // Repositorio para interactuar con la base de datos
  ) {}

  async login(loginDto: LoginDto): Promise<{ access_token: string }> {
    const user = await this.validateUser(loginDto.username, loginDto.password); // Valida las credenciales del usuario
    const payload = {
      id: user.id_user,
      rol: user.rol,
      nombre: user.nombre,
    };
    const expiresIn = '1h';
    // Firma el token con la expiración
    const access_token = this.jwtService.sign(payload, { expiresIn });

    return { access_token };
  }

  // Método privado para validar al usuario
  private async validateUser(
    username: string,
    password: string,
  ): Promise<UserSistema> {
    const user = await this.userSistemaRepository.findOne({
      where: { username }, // Busca el usuario por nombre de usuario
    });

    // Validación si existe el usuario
    if (!user) {
      console.error(`Usuario no encontrado: ${username}`);
      throw new UnauthorizedException('Este usuario no existe');
    }

    // Validación si es estado del usuario esta activo
    if (user.estado !== 1) {
      console.error(`Usuario inactivo: ${username}`);
      throw new UnauthorizedException('El usuario está inactivo');
    }

    // Comparación y validación de contraseña
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      console.error(`Contraseña incorrecta del usuario: ${username}`);
      throw new UnauthorizedException('Contraseña incorrecta');
    }

    return user;
  }
}
