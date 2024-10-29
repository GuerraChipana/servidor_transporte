import { CambiarRolUserDto } from './dto/rol-user_sistema.dto';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserSistemaDto } from './dto/create-user_sistema.dto';
import { UserSistema } from './entities/user_sistema.entity';
import * as bcrypt from 'bcrypt';
import { CambiarCredencialesDto } from './dto/cambio-credenciales-user_sistema.dto';
import { CambioEstadoUserDto } from './dto/cambio_estado-user_sistema.dto';

@Injectable()
export class UserSistemasService {
  constructor(
    @InjectRepository(UserSistema)
    private userSistemaRepository: Repository<UserSistema>,
  ) {}

  // Servicio para crear usuarios
  async create(
    createUserSistemaDto: CreateUserSistemaDto,
    id_usuario: number,
    rol: string,
  ): Promise<UserSistema> {
    // Verificacion de rol del creador
    if (
      rol === 'administrador' &&
      (createUserSistemaDto.rol === 'superadministrador' ||
        createUserSistemaDto.rol === 'administrador')
    ) {
      throw new Error(
        'Un administrador no puede crear a un superadministrador ni a otro administrador',
      );
    }

    // Hashear la contraseña antes de almacenarla
    const hashedPassword = await bcrypt.hash(createUserSistemaDto.password, 10);

    // Crear una instancia de UserSistema
    const newUser = this.userSistemaRepository.create({
      ...createUserSistemaDto,
      password: hashedPassword, // Almacena la contraseña cifrada
      id_usuario, // Asigna el ID del usuario que crea el nuevo usuario
    });

    // Guarda el nuevo usuario en la base de datos
    return await this.userSistemaRepository.save(newUser);
  }

  // Servicio para obtener todos los usuarios
  async findAll(rol: string): Promise<UserSistema[]> {
    const usuarios = await this.userSistemaRepository.find();

    // Filtro segun el rol del usuario
    return rol === 'administrador'
      ? usuarios.filter(
          (usuaio) =>
            usuaio.rol !== 'superadministrador' &&
            usuaio.rol !== 'administrador',
        )
      : usuarios; // Muestra todo para superadmin
  }

  // Servicio para encontrar un usuario por ID
  async findOne(id_user: number): Promise<UserSistema> {
    const user = await this.userSistemaRepository.findOne({
      where: { id_user }, // Busca el usuario por ID
    });
    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id_user} no encontrado`);
    }
    return user;
  }

  // Servicio para cambiar de rol a un usuario
  async CambiarRol(
    id_user: number,
    cambiarRolUserDto: CambiarRolUserDto,
    rol: string,
    id_usuario_modificacion: number,
  ): Promise<UserSistema> {
    try {
      if (rol !== 'superadministrador') {
        throw new ForbiddenException(
          'Solo el Superadministrador puede cambiar los roles',
        );
      }
      // Encontramos al usuario por ID
      const user = await this.findOne(id_user);

      // Asignacion de nuevos roles
      Object.assign(user, cambiarRolUserDto);

      // Guardar el ID del usuario que realiza la modificación y actualizar la fecha
      user.id_usuario_modificacion = id_usuario_modificacion;
      user.fecha_modificacion = new Date();

      // Lo guarda en la base de datos
      return await this.userSistemaRepository.save(user);
    } catch (error) {
      throw new Error(`Error al cambiar de rol: ${error.message}`);
    }
  }

  // Servicio para cambiar tu mismo tus credenciales
  async cambiarCredenciales(
    id_user: number,
    dto: CambiarCredencialesDto,
  ): Promise<UserSistema> {
    // Encontrar el usuario por ID
    const user = await this.findOne(id_user);

    // Verificar la contraseña actual
    const esContraseñaCorrecta = await bcrypt.compare(
      dto.password_actual,
      user.password,
    );
    if (!esContraseñaCorrecta) {
      throw new ForbiddenException('La contraseña actual es incorrecta');
    }

    // Cambiar el nombre de usuario si se proporciona
    if (dto.username) {
      user.username = dto.username;
    }

    // Cambiar la contraseña si se proporciona
    if (dto.password_nueva) {
      if (dto.password_nueva !== dto.confirmacion_password) {
        throw new ForbiddenException(
          'La nueva contraseña y la confirmación no coinciden',
        );
      }
      user.password = await bcrypt.hash(dto.password_nueva, 10);
    }

    // Guardar el ID del usuario que realiza la modificación y actualizar la fecha
    user.id_usuario_modificacion = id_user; // o id_usuario_modificacion si es diferente
    user.fecha_modificacion = new Date();

    // Guardar los cambios en la base de datos
    return await this.userSistemaRepository.save(user);
  }

  // Servicio para cambiar de estado a un usuario
  async cambioEstado(
    id_user: number,
    cambioEstadoUserDto: CambioEstadoUserDto,
    rol: string,
    id_usuario_modificacion: number,
  ): Promise<UserSistema> {
    // Encontramos al usuario por ID
    const user = await this.findOne(id_user);

    // Evitamos que un administrador cambie el estado de otro administrador o superadministrador
    if (
      rol === 'administrador' &&
      (user.rol === 'administrador' || user.rol === 'superadministrador')
    ) {
      throw new ForbiddenException(
        'No puedes cambiar el estado de otro administrador o superadministrador',
      );
    }

    // Cambiamos el estado del usuario
    user.estado = cambioEstadoUserDto.estado;

    // Validamos detalle_baja si el estado es inactivo
    if (cambioEstadoUserDto.estado === 0) {
      if (!cambioEstadoUserDto.detalle_baja) {
        throw new BadRequestException(
          'Se requiere un detalle de baja cuando el estado es inactivo',
        );
      }
      user.detalle_baja = cambioEstadoUserDto.detalle_baja;
    } else {
      user.detalle_baja = null;
    }
    user.id_usuario_modificacion = id_usuario_modificacion;
    user.fecha_modificacion = new Date();
    return await this.userSistemaRepository.save(user);
  }
}
