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
  NotFoundException,
} from '@nestjs/common';
import { AseguradorasService } from './aseguradoras.service';
import { CreateAseguradoraDto } from './dto/create-aseguradora.dto';
import { UpdateAseguradoraDto } from './dto/update-aseguradora.dto';
import { UserRequestRequest } from 'src/modules/user-request.Request';
import { JwtAuthGuard } from '../auth/jwt.auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/roles.decorator';
import { Rol } from '../user_sistemas/entities/user_sistema.entity';
import { CambioEstadoAseguradoraDto } from './dto/cambioestado.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@ApiResponse({ status: 400, description: 'Mala petición' })
@ApiTags('Endpoints de Aseguradoras')
@Controller('aseguradoras')
export class AseguradorasController {
  constructor(private readonly aseguradorasService: AseguradorasService) {}

  // Endpoints para crear
  @ApiOperation({ summary: 'Crear una aseguradora' })
  @ApiResponse({ status: 201, description: 'Aseguradora creada con éxito' })
  @ApiResponse({ status: 500, description: 'Error al crear la aseguradora' })
  @Roles(Rol.SUPERADMINISTRADOR, Rol.ADMINISTRADOR)
  @Post()
  async create(
    @Body() createAseguradoraDto: CreateAseguradoraDto,
    @Request() req: UserRequestRequest,
  ) {
    const id_usuario = req.user.id;
    try {
      return await this.aseguradorasService.create(
        createAseguradoraDto,
        id_usuario,
      );
    } catch (error) {
      throw new InternalServerErrorException(`${error.message}`);
    }
  }

  //  Endpoints para buscar todo
  @ApiOperation({ summary: 'Listado de general de aseguradoras' })
  @Roles(
    Rol.MODERADOR,
    Rol.ASISTENTE,
    Rol.ADMINISTRADOR,
    Rol.SUPERADMINISTRADOR,
  )
  @ApiResponse({ status: 200, description: 'Listado de aseguradoras completo' })
  @Get()
  async findAll() {
    return await this.aseguradorasService.findAll();
  }

  // Endpoitns para buscar por id
  @ApiOperation({ summary: 'Buscar aseguradora por Id' })
  @Roles(
    Rol.MODERADOR,
    Rol.ASISTENTE,
    Rol.ADMINISTRADOR,
    Rol.SUPERADMINISTRADOR,
  )
  @ApiResponse({ status: 200, description: 'ID de aseguradora encontrada' })
  @ApiResponse({ status: 404, description: 'No encontrado' })
  @Get(':id')
  async findOne(@Param('id') id: number) {
    try {
      return await this.aseguradorasService.findOne(id);
    } catch (error) {
      throw new NotFoundException(`${error.message}`);
    }
  }

  // Endpoints para actualizar
  @ApiOperation({ summary: 'Actualizar datos una aseguradora' })
  @Roles(Rol.ADMINISTRADOR, Rol.SUPERADMINISTRADOR)
  @ApiResponse({ status: 202, description: 'Aseguradora actualizada' })
  @Patch('edit/:id')
  async update(
    @Param('id') id: number,
    @Body() updateAseguradoraDto: UpdateAseguradoraDto,
    @Request() req: UserRequestRequest,
  ) {
    const userId = req.user.id;
    try {
      return await this.aseguradorasService.update(
        id,
        updateAseguradoraDto,
        userId,
      );
    } catch (error) {
      throw new InternalServerErrorException(`${error.message}`);
    }
  }

  // Endpoints para cambiar de estado
  @ApiOperation({ summary: 'Cambiar estado a una aseguradora' })
  @Roles(Rol.ADMINISTRADOR, Rol.SUPERADMINISTRADOR)
  @ApiResponse({ status: 202, description: 'El estado a sido cambiado' })
  @Patch('estado/:id')
  async estado(
    @Param('id') id: number,
    @Body() cambioEstadoAseguradoraDto: CambioEstadoAseguradoraDto,
    @Request() req: UserRequestRequest,
  ) {
    const userID = req.user.id;
    try {
      return await this.aseguradorasService.estado(
        id,
        cambioEstadoAseguradoraDto,
        userID,
      );
    } catch (error) {
      throw new NotFoundException(`${error.message}`);
    }
  }
}
