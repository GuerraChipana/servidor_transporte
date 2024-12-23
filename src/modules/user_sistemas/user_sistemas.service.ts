import { CambiarRolUserDto } from './dto/rol-user_sistema.dto';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserSistemaDto } from './dto/create-user_sistema.dto';
import { UserSistema } from './entities/user_sistema.entity';
import * as bcrypt from 'bcryptjs'; 
import { CambiarCredencialesDto } from './dto/cambio-credenciales-user_sistema.dto';
import { CambioEstadoUserDto } from './dto/cambio_estado-user_sistema.dto';

@Injectable()
export class UserSistemasService {
  constructor(
    @InjectRepository(UserSistema)
    private userSistemaRepository: Repository<UserSistema>,
  ) {}

  async create(
    createUserSistemaDto: CreateUserSistemaDto,
    id_usuario: number,
    rol: string,
  ): Promise<UserSistema> {
    // Verifica si el usuario ya existe por username
    const existingUserByUsername = await this.userSistemaRepository.findOne({
      where: { username: createUserSistemaDto.username },
    });
    if (existingUserByUsername) {
      throw new BadRequestException('El nombre de usuario ya está en uso');
    }

    // Verifica si el DNI ya está en uso
    const existingUserByDNI = await this.userSistemaRepository.findOne({
      where: { dni: createUserSistemaDto.dni },
    });
    if (existingUserByDNI) {
      throw new BadRequestException('El DNI ya está en uso');
    }

    // Verifica si el correo electrónico ya está en uso
    const existingUserByEmail = await this.userSistemaRepository.findOne({
      where: { email: createUserSistemaDto.email },
    });
    if (existingUserByEmail) {
      throw new BadRequestException('El correo electrónico ya está en uso');
    }

    // Verificación de rol del creador
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
      password: hashedPassword,
      id_usuario,
    });

    // Guarda el nuevo usuario en la base de datos
    return await this.userSistemaRepository.save(newUser);
  }

  //  Servicio para obtener todos los usuarios    //
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

  // Servicio para encontrar un usuario por ID    //
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
    rol: string, // Rol del usuario que está realizando la acción
    id_usuario_modificacion: number, // ID del usuario que realiza la modificación
  ): Promise<UserSistema> {
    try {
      if (rol === 'superadministrador') {
        const user = await this.findOne(id_user);
        Object.assign(user, cambiarRolUserDto);
        user.id_usuario_modificacion = id_usuario_modificacion;

        return await this.userSistemaRepository.save(user);
      }
      if (rol === 'administrador') {
        const nuevoRol = cambiarRolUserDto.rol;
        if (['administrador', 'superadministrador'].includes(nuevoRol)) {
          throw new ForbiddenException(
            'No puedes cambiar el rol a otro administrador o superadministrador',
          );
        }
        if (!['asistente', 'moderador'].includes(nuevoRol)) {
          throw new ForbiddenException(
            'El administrador solo puede cambiar a rol de asistente o moderador',
          );
        }
        const user = await this.findOne(id_user);
        Object.assign(user, cambiarRolUserDto);
        user.id_usuario_modificacion = id_usuario_modificacion;
        return await this.userSistemaRepository.save(user);
      }
      throw new ForbiddenException(
        'Solo el Superadministrador o Administrador pueden cambiar roles',
      );
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
    if (
      !dto.password_actual ||
      !(await bcrypt.compare(dto.password_actual, user.password))
    ) {
      throw new ForbiddenException('La contraseña actual es incorrecta');
    }

    // Cambiar el nombre de usuario si se proporciona y es diferente
    if (dto.username && dto.username !== user.username) {
      const existingUser = await this.userSistemaRepository.findOne({
        where: { username: dto.username },
      });
      if (existingUser) {
        throw new BadRequestException('El nombre de usuario ya está en uso');
      }
      user.username = dto.username;
    }

    // Cambiar el correo electrónico si se proporciona y es diferente
    if (dto.email && dto.email !== user.email) {
      const existingEmail = await this.userSistemaRepository.findOne({
        where: { email: dto.email },
      });
      if (existingEmail) {
        throw new BadRequestException('El correo electrónico ya está en uso');
      }
      user.email = dto.email;
    }

    // Cambiar la contraseña si se proporciona y es diferente
    if (dto.password_nueva) {
      if (dto.password_nueva === dto.password_actual) {
        throw new BadRequestException(
          'La nueva contraseña no puede ser la misma que la actual',
        );
      }
      if (dto.password_nueva !== dto.confirmacion_password) {
        throw new ForbiddenException(
          'La nueva contraseña y la confirmación no coinciden',
        );
      }
      user.password = await bcrypt.hash(dto.password_nueva, 10);
    }

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
    const user = await this.userSistemaRepository.findOne({
      where: { id_user: id_user },
    });

    // Verificar si el usuario existe
    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id_user} no encontrado.`);
    }

    // Si el rol es administrador, no puede cambiar el estado de otro administrador o superadministrador
    if (
      rol === 'administrador' &&
      (user.rol === 'administrador' || user.rol === 'superadministrador')
    ) {
      throw new ForbiddenException(
        'No puedes cambiar el estado de otro administrador o superadministrador',
      );
    }

    // Si el rol es superadministrador, puede cambiar el estado de cualquier usuario
    if (rol === 'superadministrador') {
      // No necesitas hacer ninguna validación adicional aquí, ya que un superadministrador puede cambiar a cualquier usuario
    } else if (rol !== 'administrador') {
      // Maneja otros roles si es necesario
      throw new ForbiddenException(
        'Rol no autorizado para cambiar el estado del usuario',
      );
    }

    // Cambiamos el estado del usuario
    user.estado = cambioEstadoUserDto.estado;

    // Validamos detalle_baja si el estado es inactivo
    if (cambioEstadoUserDto.estado === 0) {
      if (
        !cambioEstadoUserDto.detalle_baja ||
        cambioEstadoUserDto.detalle_baja.trim() === ''
      ) {
        throw new BadRequestException(
          'Se requiere un detalle de baja cuando el estado es inactivo',
        );
      }
      user.detalle_baja = cambioEstadoUserDto.detalle_baja;
    } else {
      user.detalle_baja = null;
    }

    user.id_usuario_modificacion = id_usuario_modificacion;

    try {
      return await this.userSistemaRepository.save(user);
    } catch (error) {
      throw new InternalServerErrorException(
        'Ocurrió un error al cambiar el estado del usuario',
      );
    }
  }
}
