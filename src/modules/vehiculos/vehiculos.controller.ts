import {
  Controller,
  Post,
  Body,
  UploadedFile,
  Request,
  BadRequestException,
  UseInterceptors,
  Param,
  Patch,
  Get,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { VehiculoResponseDto, VehiculosService } from './vehiculos.service';
import { CreateVehiculoDto } from './dto/create-vehiculo.dto';
import { UserRequestRequest } from '../user-request.Request';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UpdateVehiculoDto } from './dto/update-vehiculo.dto';
import { CambioEstadoVehiculoDto } from './dto/cambioestado-vehiculo.dto';
import { JwtAuthGuard } from '../auth/jwt.auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Rol } from '../user_sistemas/entities/user_sistema.entity';

@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Endpoints para vehiculos')
@Controller('vehiculos')
export class VehiculosController {
  constructor(private readonly vehiculosService: VehiculosService) {}

  @Roles(Rol.SUPERADMINISTRADOR, Rol.ADMINISTRADOR)
  @Post()
  @ApiOperation({ summary: 'Crear un nuevo vehículo' }) // Descripción de la operación
  @ApiResponse({ status: 201, description: 'Vehículo creado exitosamente.' })
  @ApiResponse({ status: 400, description: 'Error en los datos de entrada.' })
  @UseInterceptors(FileInterceptor('imagen'))
  async create(
    @Body() createVehiculoDto: CreateVehiculoDto,
    @UploadedFile() file: Express.Multer.File,
    @Request() req: UserRequestRequest,
  ) {
    const userId = req.user.id;
    if (file) {
      try {
      } catch (error) {
        throw new BadRequestException(
          'Error al procesar la imagen: ' + error.message,
        );
      }
    }

    return this.vehiculosService.create(createVehiculoDto, userId, file);
  }

  @Roles(Rol.SUPERADMINISTRADOR, Rol.ADMINISTRADOR)
  @Patch('edit/:id')
  @ApiOperation({ summary: 'Actualizar un vehículo existente' })
  @ApiResponse({ status: 200, description: 'Vehículo editado exitosamente.' })
  @ApiResponse({ status: 400, description: 'Error en los datos de entrada.' })
  @ApiResponse({ status: 404, description: 'Vehículo no encontrado.' })
  @UseInterceptors(FileInterceptor('imagen'))
  async update(
    @Param('id') id: number,
    @Body() updateVehiculoDto: UpdateVehiculoDto,
    @UploadedFile() file: Express.Multer.File,
    @Request() req: UserRequestRequest,
  ) {
    const userId = req.user.id;

    return this.vehiculosService.update(id, updateVehiculoDto, file, userId);
  }

  @Roles(
    Rol.SUPERADMINISTRADOR,
    Rol.ADMINISTRADOR,
    Rol.MODERADOR,
    Rol.ASISTENTE,
  )
  @Get()
  @ApiOperation({ summary: 'Listar todos los vehículos' })
  @ApiResponse({ status: 200, description: 'Lista de vehículos.' })
  @ApiResponse({ status: 400, description: 'Error en los datos de entrada.' })
  async findAll(): Promise<VehiculoResponseDto[]> {
    return this.vehiculosService.findAll();
  }

  @Roles(
    Rol.SUPERADMINISTRADOR,
    Rol.ADMINISTRADOR,
    Rol.MODERADOR,
    Rol.ASISTENTE,
  )
  @Get(':id')
  @ApiOperation({ summary: 'Buscar un vehículo por ID' })
  @ApiResponse({ status: 200, description: 'Vehículo encontrado.' })
  @ApiResponse({ status: 400, description: 'Error en los datos de entrada.' })
  @ApiResponse({ status: 404, description: 'Vehículo no encontrado.' })
  async findOne(@Param('id') id: number): Promise<VehiculoResponseDto> {
    const vehiculo = await this.vehiculosService.findOne(id);
    if (!vehiculo) {
      throw new NotFoundException(`Vehículo con ID ${id} no encontrado`);
    }
    return vehiculo;
  }

  @Roles(Rol.SUPERADMINISTRADOR, Rol.ADMINISTRADOR)
  @Patch('estado/:id')
  @ApiOperation({ summary: 'Cambiar el estado de un vehículo' })
  @ApiResponse({ status: 200, description: 'Estado del vehículo actualizado.' })
  @ApiResponse({ status: 400, description: 'Error en los datos de entrada.' })
  @ApiResponse({ status: 404, description: 'Vehículo no encontrado.' })
  async cambiarEstado(
    @Param('id') id: number,
    @Body() cambioEstadoVehiculoDto: CambioEstadoVehiculoDto,
    @Request() req: UserRequestRequest,
  ) {
    const userId = req.user.id;
    return this.vehiculosService.estado(id, cambioEstadoVehiculoDto, userId);
  }
}
