import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Request,
  InternalServerErrorException,
  UseGuards,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { TucService } from './tuc.service';
import { CreateTucDto } from './dto/create-tuc.dto';
import { UpdateTucDto } from './dto/update-tuc.dto';
import { UserRequestRequest } from '../user-request.Request';
import { JwtAuthGuard } from '../auth/jwt.auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { EstadoDtoTuc } from './dto/estado-tuc.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/roles.decorator';
import { Rol } from '../user_sistemas/entities/user_sistema.entity';

@ApiResponse({ status: 511, description: 'Auntenticacion requerida.' })
@ApiResponse({ status: 400, description: 'Mala petición' })
@ApiTags('Endpoints de TUC')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/tuc')
export class TucController {
  constructor(private readonly tucService: TucService) {}

  @ApiOperation({ summary: 'Registrar un nuevo usuario al sistema' })
  @Roles(Rol.SUPERADMINISTRADOR, Rol.ADMINISTRADOR)
  @ApiResponse({ status: 201, description: 'Tuc registrado con éxito.' })
  @ApiResponse({ status: 500, description: 'Error al crear el TUC.' })
  @Post()
  async create(
    @Body() createTucDto: CreateTucDto,
    @Request() req: UserRequestRequest,
  ) {
    const userId = req.user.id;
    try {
      return await this.tucService.create(userId, createTucDto);
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
  @ApiResponse({ status: 200, description: 'Listado de Tucs completo' })
  @ApiOperation({ summary: 'Listado completo de las Tucs' })
  @Get()
  async findAll() {
    try {
      return await this.tucService.findAll();
    } catch (error) {
      throw new InternalServerErrorException(`${error.message}`);
    }
  }

  @Roles(
    Rol.MODERADOR,
    Rol.ASISTENTE,
    Rol.ADMINISTRADOR,
    Rol.SUPERADMINISTRADOR,
  )
  @ApiResponse({ status: 200, description: 'ID de tuc encontrado' })
  @ApiOperation({ summary: 'Buscar Tuc por ID' })
  @Get(':id')
  async findOne(@Param('id') id: number) {
    try {
      return await this.tucService.findOne(id);
    } catch (error) {
      throw new NotFoundException(`Id no encontrado ${id} ${error.message}`);
    }
  }

  @Roles(Rol.ADMINISTRADOR, Rol.SUPERADMINISTRADOR)
  @ApiResponse({ status: 200, description: 'Actualizacion exitosa' })
  @ApiOperation({ summary: 'Edición de un Tuc' })
  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() updateTucDto: UpdateTucDto,
    @Request() req: UserRequestRequest,
  ) {
    const userId = req.user.id;

    return await this.tucService.update(id, updateTucDto, userId);
  }

  @Roles(Rol.ADMINISTRADOR, Rol.SUPERADMINISTRADOR)
  @ApiResponse({ status: 200, description: 'Estado cambio exitoso' })
  @ApiOperation({ summary: 'Cambiar estado de un Tuc' })
  @Patch('estado/:id')
  estado(
    @Param('id') id: number,
    @Body() estadoDtoTuc: EstadoDtoTuc,
    @Request() req: UserRequestRequest,
  ) {
    const userId = req.user.id;
    try {
      return this.tucService.estado(id, estadoDtoTuc, userId);
    } catch (error) {
      throw new InternalServerErrorException(`${error.message}`);
    }
  }
}
