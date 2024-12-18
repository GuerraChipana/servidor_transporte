import {
  Controller,
  Post,
  Body,
  Request,
  HttpCode,
  InternalServerErrorException,
  UseGuards,
  Get,
  Param,
  NotFoundException,
  Patch,
} from '@nestjs/common';
import { UserSistemasService } from './user_sistemas.service';
import { CreateUserSistemaDto } from './dto/create-user_sistema.dto';
import { ApiTags, ApiBody, ApiResponse, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt.auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Rol } from './entities/user_sistema.entity';
import { CambiarRolUserDto } from './dto/rol-user_sistema.dto';
import { CambiarCredencialesDto } from './dto/cambio-credenciales-user_sistema.dto';
import { CambioEstadoUserDto } from './dto/cambio_estado-user_sistema.dto';
import { UserRequestRequest } from '../user-request.Request';

@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Endpoints de Usuarios de Sistemas')
@Controller('api/users')
export class UserSistemasController {
  constructor(private readonly userSistemasService: UserSistemasService) {}

  // Endpoints para crear un nuevo usuario:
  @ApiOperation({ summary: 'Registrar un nuevo usuario al sistema' })
  @Roles(Rol.SUPERADMINISTRADOR, Rol.ADMINISTRADOR)
  @HttpCode(201)
  @Post('registrar')
  @ApiBody({ type: CreateUserSistemaDto })
  @ApiResponse({ status: 201, description: 'Usuario registrado con éxito.' })
  @ApiResponse({ status: 500, description: 'Error al crear el usuario.' })
  @ApiResponse({ status: 511, description: 'Auntenticacion requerida.' })
  async create(
    @Body() createUserSistemaDto: CreateUserSistemaDto,
    @Request() req: UserRequestRequest,
  ) {
    const id_usuario = req.user.id;
    const rol = req.user.rol;
    try {
      return await this.userSistemasService.create(
        createUserSistemaDto,
        id_usuario,
        rol,
      );
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Error al crear el usuario');
    }
  }

  // Endpoints para listado de todos los usuarios:
  @ApiOperation({ summary: 'Listar todos los usuarios del sistema' })
  @Roles(Rol.SUPERADMINISTRADOR, Rol.ADMINISTRADOR)
  @Get('listar')
  @ApiResponse({ status: 200, description: 'Listado de usuarios con exito' })
  @ApiResponse({ status: 500, description: 'Error al listar usuarios' })
  @ApiResponse({ status: 511, description: 'Auntenticacion requerida.' })
  async findAll(@Request() req: UserRequestRequest) {
    const rol = req.user.rol;
    try {
      return await this.userSistemasService.findAll(rol);
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        'Error al obtener la lista de usuarios',
      );
    }
  }

  // Endpoints para listar por id:
  @ApiOperation({ summary: 'Buscar un usuario del sistema por su Id' })
  @Get(':id')
  @Roles(Rol.SUPERADMINISTRADOR, Rol.ADMINISTRADOR)
  @ApiResponse({ status: 511, description: 'Token requerido' })
  @ApiResponse({ status: 200, description: 'Usuario encontrado' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  async findOne(@Param('id') id: number) {
    try {
      return await this.userSistemasService.findOne(id);
    } catch (error) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }
  }

  // Endpoints para cambiar de Rol a un usuario
  @ApiOperation({ summary: 'Cambiar de rol a un usuario' })
  @Roles(Rol.SUPERADMINISTRADOR, Rol.ADMINISTRADOR)
  @Patch('rol/:id')
  @ApiResponse({
    status: 401,
    description: 'La solicitud no tiene autorización.',
  })
  @ApiResponse({
    status: 200,
    description: 'Rol del usuario cambiado con éxito.',
  })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado.' })
  @ApiResponse({ status: 400, description: 'Solicitud inválida.' })
  async CambiarRol(
    @Param('id') id: number,
    @Body() cambiarRolUserDto: CambiarRolUserDto,
    @Request() req: UserRequestRequest,
  ) {
    const rol = req.user.rol;
    const id_usuario_modificacion = req.user.id;
    try {
      return await this.userSistemasService.CambiarRol(
        id,
        cambiarRolUserDto,
        rol,
        id_usuario_modificacion,
      );
    } catch (error) {
      console.error(error);
      throw new NotFoundException(`${error.message}`);
    }
  }

  // Endpoints para cambiar tus mismas credenciales
  @ApiOperation({ summary: 'Cambiar tus propios datos' })
  @Roles(
    Rol.MODERADOR,
    Rol.ASISTENTE,
    Rol.ADMINISTRADOR,
    Rol.SUPERADMINISTRADOR,
  )
  @Patch('cambio-credencial')
  @ApiResponse({
    status: 200,
    description: 'Credenciales cambiadas con éxito.',
  })
  @ApiResponse({
    status: 403,
    description:
      'Contraseña actual incorrecta o no coinciden las nuevas contraseñas.',
  })
  async cambiarCredencial(
    @Request() req: UserRequestRequest,
    @Body() cambiarCredencialesDto: CambiarCredencialesDto,
  ) {
    const id_user = req.user.id;
    return await this.userSistemasService.cambiarCredenciales(
      id_user,
      cambiarCredencialesDto,
    );
  }

  // Endpoints para cambiar de estado a un usuario
  @ApiOperation({ summary: 'Cambior estado a un usuario' })
  @Roles(Rol.SUPERADMINISTRADOR, Rol.ADMINISTRADOR)
  @ApiResponse({
    status: 404,
    description:
      'El servidor no pudo encontrar el recurso solicitado por el cliente.',
  })
  @ApiResponse({
    status: 500,
    description:
      'El servidor encontró un error interno y no pudo completar la solicitud del cliente.',
  })
  @Patch('estado/:id')
  async cambioEstadoUser(
    @Param('id') id: number,
    @Request() req: UserRequestRequest,
    @Body() cambioEstadoUserDto: CambioEstadoUserDto,
  ) {
    const id_user_modificacion = req.user.id;
    const rol = req.user.rol;

    try {
      const user = await this.userSistemasService.findOne(id); // Encuentra al usuario
      if (!user) {
        throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
      }

      return await this.userSistemasService.cambioEstado(
        id,
        cambioEstadoUserDto,
        rol,
        id_user_modificacion,
      );
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        'Ocurrió un error al cambiar el estado del usuario',
      );
    }
  }
}
