import {
  Controller,
  Get,
  Post,
  Body,
  Request,
  Patch,
  Param,
  InternalServerErrorException,
  NotFoundException,
  UseGuards,
  BadRequestException,
  Put,
} from '@nestjs/common';
import { ConductoresService } from './conductores.service';
import { CreateConductoreDto } from './dto/create-conductore.dto';
import { UpdateConductoreDto } from './dto/update-conductore.dto';
import { UserRequestRequest } from '../user-request.Request';
import { CambioEstadoConducotoreDto } from './dto/cambioestado-conductore.dto';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt.auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Rol } from '../user_sistemas/entities/user_sistema.entity';

@UseGuards(JwtAuthGuard, RolesGuard)
@ApiResponse({ status: 400, description: 'Mala peticion' })
@ApiTags('Endpoints de Conductores')
@Controller('conductores')
export class ConductoresController {
  constructor(private readonly conductoresService: ConductoresService) {}

  // Endpoint para crear conductor
  @ApiResponse({ status: 201, description: 'Conductor creado con éxito' })
  @ApiResponse({
    status: 400,
    description: 'Error en la solicitud. Datos incorrectos.',
  })
  @ApiResponse({ status: 500, description: 'Error al crear el conductor' })
  @Roles(Rol.ADMINISTRADOR, Rol.SUPERADMINISTRADOR)
  @Post()
  async create(
    @Body() createConductoreDto: CreateConductoreDto,
    @Request() req: UserRequestRequest,
  ) {
    const userId = req.user.id; // Obtener el ID del usuario autenticado

    try {
      // Llamar al servicio para crear el conductor
      return await this.conductoresService.create(createConductoreDto, userId);
    } catch (error) {
      // Manejo de excepciones específicas
      if (error instanceof BadRequestException) {
        throw error; // Si es un error de mala solicitud, lo lanzamos directamente
      }
      // Otros errores internos
      throw new InternalServerErrorException(
        `Error al crear el conductor: ${error.message}`,
      );
    }
  }
  @Roles(Rol.ADMINISTRADOR, Rol.SUPERADMINISTRADOR)
  @Patch('edit/:id')
  async update(
    @Param('id') id: number,
    @Body() updateConductoreDto: UpdateConductoreDto,
    @Request() req: UserRequestRequest,
  ) {
    const userId = req.user.id;
    try {
      return await this.conductoresService.update(
        id,
        updateConductoreDto,
        userId,
      );
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(`${error.message}`);
      }
      if (error instanceof BadRequestException) {
        throw new BadRequestException(`${error.message}`);
      }
      // Otros errores internos pueden ser manejados aquí
      throw new InternalServerErrorException(
        `Error inesperado en el servidor ${error.message}`,
      );
    }
  }

  // Endpoints para cambiar de estado
  @Roles(Rol.ADMINISTRADOR, Rol.SUPERADMINISTRADOR)
  @ApiResponse({ status: 202, description: 'El estado a sido cambiado' })
  @Patch('estado/:id')
  async estado(
    @Param('id') id: number,
    @Body() cambioEstadoConducotoreDto: CambioEstadoConducotoreDto,
    @Request() req: UserRequestRequest,
  ) {
    const userId = req.user.id;
    try {
      return await this.conductoresService.estado(
        id,
        cambioEstadoConducotoreDto,
        userId,
      );
    } catch (error) {
      throw new InternalServerErrorException(
        `Error al cambiar el estado: ${error.message}`,
      );
    }
  }

  // Endpoints listar todo
  @Roles(
    Rol.MODERADOR,
    Rol.ASISTENTE,
    Rol.ADMINISTRADOR,
    Rol.SUPERADMINISTRADOR,
  )
  @ApiResponse({ status: 200, description: 'Listado de conductores completo' })
  @Get()
  async findAll() {
    try {
      return await this.conductoresService.findAll();
    } catch (error) {
      throw new InternalServerErrorException(
        `Error al obtener los conductores: ${error.message}`,
      );
    }
  }

  // Endpoints para buscar por ID
  @ApiResponse({ status: 200, description: 'ID de conductor no encontrado' })
  @ApiResponse({ status: 404, description: 'No encontrado' })
  @Roles(
    Rol.MODERADOR,
    Rol.ASISTENTE,
    Rol.ADMINISTRADOR,
    Rol.SUPERADMINISTRADOR,
  )
  @Get(':id')
  async findOne(@Param('id') id: number) {
    try {
      const conductor = await this.conductoresService.findOne(id);
      return conductor;
    } catch (error) {
      throw new NotFoundException(`${error.mesage}`);
    }
  }

  // Endpoint para asociar vehículos a un conductor
  @Roles(Rol.ADMINISTRADOR, Rol.SUPERADMINISTRADOR)
  @ApiResponse({ status: 200, description: 'Vehículos asociados con éxito' })
  @Patch('asociarVehiculo/:id')
  async asociarVehiculos(
    @Param('id') id: number,
    @Body() body: { vehiculos: number[] },
  ) {
    try {
      // Extraer el array de vehiculos del body
      const vehiculosIds = body.vehiculos;

      // Llamar al servicio para asociar los vehículos al conductor
      return await this.conductoresService.asociarVehiculosConductor(
        id, // ID del conductor
        vehiculosIds, // Array de IDs de vehículos
      );
    } catch (error) {
      // Manejo específico de excepciones
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message); // Devolver error 404 si el recurso no fue encontrado
      }
      if (error instanceof BadRequestException) {
        throw new BadRequestException(error.message); // Devolver error 400 si la solicitud es incorrecta
      }
      // Si ocurre cualquier otro tipo de error, devolver error interno 500
      throw new InternalServerErrorException(
        `Error al asociar vehículos al conductor: ${error.message || error}`,
      );
    }
  }
}
