import {
  Controller,
  Get,
  Post,
  Body,
  Request,
  Patch,
  Param,
  Delete,
  InternalServerErrorException,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { AsociacionesService } from './asociaciones.service';
import { CreateAsociacioneDto } from './dto/create-asociacione.dto';
import { UpdateAsociacioneDto } from './dto/update-asociacione.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt.auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Rol } from '../user_sistemas/entities/user_sistema.entity';
import { Roles } from '../auth/roles.decorator';
import { CambioEstadoAcociacionDto } from './dto/cambio_estado-asociacione.dto';
import { UserRequestRequest } from 'src/modules/user-request.Request';

@UseGuards(JwtAuthGuard, RolesGuard)
@ApiResponse({ status: 400, description: 'Mala petición' })
@ApiTags('Endpoints de Asociaciones')
@Controller('asociaciones')
export class AsociacionesController {
  constructor(private readonly asociacionesService: AsociacionesService) {}

  @ApiResponse({ status: 201, description: 'Asociacion creada con éxito' })
  @ApiResponse({ status: 500, description: 'Error al crear la aseguradora' })
  @ApiOperation({ summary: 'Crear una asociacion' })
  @Roles(Rol.SUPERADMINISTRADOR, Rol.ADMINISTRADOR)
  @Post()
  async create(
    @Body() createAsociacioneDto: CreateAsociacioneDto,
    @Request() req: UserRequestRequest,
  ) {
    const id_usuario = req.user.id;
    try {
      return await this.asociacionesService.create(
        createAsociacioneDto,
        id_usuario,
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
  @ApiResponse({ status: 200, description: 'Listado de asociaciones completo' })
  @ApiOperation({ summary: 'Listado completo de las asociaciones' })
  @Get('listar')
  async findAll() {
    return await this.asociacionesService.findAll();
  }

  @Roles(
    Rol.MODERADOR,
    Rol.ASISTENTE,
    Rol.ADMINISTRADOR,
    Rol.SUPERADMINISTRADOR,
  )
  @ApiResponse({
    status: 200,
    description: 'ID de asociacion buscada correctamente',
  })
  @ApiOperation({ summary: 'Buscar asociacion por ID' })
  @Get('listar/:id')
  async findOne(@Param('id') id: number) {
    try {
      return await this.asociacionesService.findOne(id);
    } catch (error) {
      throw new NotFoundException(`${error.message}`);
    }
  }

  @ApiResponse({ status: 202, description: 'El estado a sido cambiado' })
  @ApiResponse({ status: 404, description: 'No encontrado' })
  @Roles(Rol.SUPERADMINISTRADOR, Rol.ADMINISTRADOR)
  @ApiOperation({ summary: 'Cambiar estado a una persona' })
  @Patch('estado/:id')
  async estado(
    @Param('id') id: number,
    @Body() cambioEstadoAcociacionDto: CambioEstadoAcociacionDto,
    @Request() req: UserRequestRequest,
  ) {
    const userId = req.user.id;
    try {
      return await this.asociacionesService.estado(
        id,
        cambioEstadoAcociacionDto,
        userId,
      );
    } catch (error) {
      throw new NotFoundException(`${error.message}`);
    }
  }

  @ApiResponse({ status: 202, description: 'Asociacion actualizada ' })
  @ApiResponse({ status: 404, description: 'No encontrado' })
  @ApiOperation({ summary: 'Actualizar datos de una asociacion' })
  @Patch('edit/:id')
  async edit(
    @Param('id') id: number,
    @Body() updateAsociacioneDto: UpdateAsociacioneDto,
    @Request() req: UserRequestRequest,
  ) {
    const userId = req.user.id;

    try {
      return await this.asociacionesService.update(
        id,
        updateAsociacioneDto,
        userId,
      );
    } catch (error) {
      throw new InternalServerErrorException(`${error.message}`);
    }
  }
}
