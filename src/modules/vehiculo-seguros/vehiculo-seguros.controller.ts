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
  NotFoundException,
} from '@nestjs/common';
import { VehiculoSegurosService } from './vehiculo-seguros.service';
import { CreateVehiculoSeguroDto } from './dto/create-vehiculo-seguro.dto';
import { UpdateVehiculoSeguroDto } from './dto/update-vehiculo-seguro.dto';
import { UserRequestRequest } from '../user-request.Request';
import { JwtAuthGuard } from '../auth/jwt.auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { CambioEstadoSeguroVehiculoDto } from './dto/cambioestado-conductore.dto';
import { Roles } from '../auth/roles.decorator';
import { Rol } from '../user_sistemas/entities/user_sistema.entity';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@UseGuards(JwtAuthGuard, RolesGuard)
@ApiResponse({ status: 400, description: 'Mala petición' })
@ApiTags('Endpoints de Seguro vehicular')
@Controller('vehiculo-seguros')
export class VehiculoSegurosController {
  constructor(
    private readonly vehiculoSegurosService: VehiculoSegurosService,
  ) {}

  @ApiResponse({ status: 201, description: 'Seguro creado con éxito' })
  @ApiResponse({ status: 500, description: 'Error al crear el seguro' })
  @ApiOperation({ summary: 'Crear un seguro vehicular' })
  @Roles(Rol.SUPERADMINISTRADOR, Rol.ADMINISTRADOR)
  @Post()
  async create(
    @Body() createVehiculoSeguroDto: CreateVehiculoSeguroDto,
    @Request() req: UserRequestRequest,
  ) {
    const userId = req.user.id;
    try {
      return await this.vehiculoSegurosService.create(
        createVehiculoSeguroDto,
        userId,
      );
    } catch (error) {
      throw new InternalServerErrorException(` ${error.message}`);
    }
  }

  @ApiResponse({ status: 201, description: 'Seguro editado con éxito' })
  @ApiResponse({ status: 500, description: 'Error al editar el seguro' })
  @ApiOperation({ summary: 'Actualizar un seguro vehicular' })
  @Roles(Rol.SUPERADMINISTRADOR, Rol.ADMINISTRADOR)
  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() updateVehiculoSeguroDto: UpdateVehiculoSeguroDto,
    @Request() req: UserRequestRequest,
  ) {
    const userId = req.user.id;
    try {
      return this.vehiculoSegurosService.update(
        id,
        updateVehiculoSeguroDto,
        userId,
      );
    } catch (error) {
      throw new InternalServerErrorException(`${error.message}`);
    }
  }

  
  @ApiResponse({ status: 201, description: 'Estado del seguro cambiado con éxito' })
  @ApiOperation({ summary: 'Cambiar estado a un seguro' })
  @Roles(Rol.SUPERADMINISTRADOR, Rol.ADMINISTRADOR)
  @Patch('estado/:id')
  async estado(
    @Param('id') id: number,
    @Body() cambioEstadoSeguroVehiculoDto: CambioEstadoSeguroVehiculoDto,
    @Request() req: UserRequestRequest,
  ) {
    const userId = req.user.id;
    try {
      return await this.vehiculoSegurosService.estado(
        id,
        cambioEstadoSeguroVehiculoDto,
        userId,
      );
    } catch (error) {
      throw new NotFoundException(`${error.message}`);
    }
  }


  @ApiResponse({ status: 200, description: 'Listado de Seguros completo' })
  @ApiOperation({ summary: 'Listado completo de los seguros' })
  @Roles(
    Rol.SUPERADMINISTRADOR,
    Rol.ADMINISTRADOR,
    Rol.MODERADOR,
    Rol.ASISTENTE,
  )
  @Get()
  async findAll() {
    return await this.vehiculoSegurosService.findAll();
  }

  @ApiResponse({ status: 200, description: 'Id del seguro buscado correctamente' })
  @ApiOperation({ summary: 'Buscador por Id del seguro' })
  @Roles(
    Rol.SUPERADMINISTRADOR,
    Rol.ADMINISTRADOR,
    Rol.MODERADOR,
    Rol.ASISTENTE,
    
  )
  @Get(':id')
  findOne(@Param('id') id: number) {
    try {
      return this.vehiculoSegurosService.findOne(id);
    } catch (error) {
      throw new NotFoundException(`${error.message}`);
    }
  }
}
