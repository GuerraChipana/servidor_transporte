import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  InternalServerErrorException,
  UseGuards,
} from '@nestjs/common';
import { EmpadronamientoService } from './empadronamiento.service';
import { CreateEmpadronamientoDto } from './dto/create-empadronamiento.dto';
import { UpdateEmpadronamientoDto } from './dto/update-empadronamiento.dto';
import { UserRequestRequest } from '../user-request.Request';
import { JwtAuthGuard } from '../auth/jwt.auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { EstadoEmpadronamientoDto } from './dto/estado-empadronamiento.dto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Roles } from '../auth/roles.decorator';
import { Rol } from '../user_sistemas/entities/user_sistema.entity';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('empadronamiento')
export class EmpadronamientoController {
  constructor(
    private readonly empadronamientoService: EmpadronamientoService,
  ) {}

  @ApiOperation({ summary: 'Registrar un nuevo usuario al sistema' })
  @Roles(Rol.SUPERADMINISTRADOR, Rol.ADMINISTRADOR)
  @ApiResponse({
    status: 201,
    description: 'Empadronamiento registrado con éxito.',
  })
  @ApiResponse({ status: 500, description: 'Erro al crear .' })
  @Post()
  async create(
    @Body() createEmpadronamientoDto: CreateEmpadronamientoDto,
    @Request() req: UserRequestRequest,
  ) {
    const userId = req.user.id;
    try {
      return await this.empadronamientoService.create(
        createEmpadronamientoDto,
        userId,
      );
    } catch (error) {
      throw new InternalServerErrorException(` ${error.message}`);
    }
  }

  @Roles(
    Rol.MODERADOR,
    Rol.ASISTENTE,
    Rol.ADMINISTRADOR,
    Rol.SUPERADMINISTRADOR,
  )
  @ApiResponse({
    status: 200,
    description: 'Listado de empadronamiento completo',
  })
  @ApiOperation({ summary: 'Listado completo de las Empadronamientos' })
  @Get()
  findAll() {
    return this.empadronamientoService.findAll();
  }

  @Roles(
    Rol.MODERADOR,
    Rol.ASISTENTE,
    Rol.ADMINISTRADOR,
    Rol.SUPERADMINISTRADOR,
  )
  @ApiResponse({ status: 200, description: 'ID de empadronamiento encontrado' })
  @ApiOperation({ summary: 'Buscar empadronamiento por ID' })
  @Get(':id')
  async findOne(@Param('id') id: number) {
    try {
      return await this.empadronamientoService.findOne(id);
    } catch (error) {
      throw new InternalServerErrorException(`${error.message}`);
    }
  }

  @Roles(Rol.ADMINISTRADOR, Rol.SUPERADMINISTRADOR)
  @ApiResponse({ status: 200, description: 'Actualizado existosamente' })
  @ApiOperation({ summary: 'Actualizar un empadronamiento' })
  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() updateEmpadronamientoDto: UpdateEmpadronamientoDto,
    @Request() req: UserRequestRequest,
  ) {
    const userId = req.user.id;
    return this.empadronamientoService.update(
      id,
      updateEmpadronamientoDto,
      userId,
    );
  }

  @Roles(Rol.ADMINISTRADOR, Rol.SUPERADMINISTRADOR)
  @ApiResponse({ status: 200, description: 'Cambio de estado exitoso' })
  @ApiOperation({ summary: 'Cambiar estado a un empadronamiento' })
  @Patch('estado/:id')
  async estado(
    @Param('id') id: number,
    @Body() estadoDTO: EstadoEmpadronamientoDto,
    @Request() req: UserRequestRequest,
  ) {
    const userId = req.user.id;
    return await this.empadronamientoService.estado(id, estadoDTO, userId);
  }
}
