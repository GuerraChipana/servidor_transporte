import {
  Controller,
  Post,
  Body,
  Patch,
  UseGuards,
  HttpCode,
  Request,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Get,
} from '@nestjs/common';
import { PersonaService } from './personas.service';
import { CreatePersonaDto } from './dto/create-persona.dto'; // Asegúrate de importar el DTO
import { ApiTags, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt.auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Rol } from '../user_sistemas/entities/user_sistema.entity';
import { UpdatePersonaDto } from './dto/update-persona.dto';
import { CambioEstadoPersonaDto } from './dto/estado-persona.dto';

interface UserRequest extends Request {
  user: {
    id: number;
    username: string;
    rol: string;
  };
}
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Endpoints de Personas')
@Controller('personas')
export class PersonasController {
  constructor(private readonly personasService: PersonaService) {}

  @Roles(Rol.SUPERADMINISTRADOR, Rol.ADMINISTRADOR)
  @Post('registro')
  @HttpCode(201)
  @ApiResponse({ status: 201, description: 'Persona creada con éxito.' })
  @ApiResponse({ status: 500, description: 'Error al crear la persona.' })
  async create(@Body() body: CreatePersonaDto, @Request() req: UserRequest) {
    const userId = req.user.id;

    try {
      const persona = await this.personasService.create(
        body.dni,
        userId,
        body.telefono,
        body.email,
      );
      return {
        id: persona.id,
        dni: persona.dni,
        nombre: persona.nombre,
        apPaterno: persona.apPaterno,
        apMaterno: persona.apMaterno,
        telefono: persona.telefono,
        email: persona.email,
        ubigeo: persona.ubigeo,
        domicilio: persona.domicilio,
        foto: persona.foto,
        fechaRegistro: persona.fecha_registro,
      };
    } catch (error) {
      console.error('Error al crear la persona:', error);
      throw new InternalServerErrorException(
        `Error al crear la persona: ${error.message}`,
      );
    }
  }

  @Roles(
    Rol.SUPERADMINISTRADOR,
    Rol.ADMINISTRADOR,
    Rol.MODERADOR,
    Rol.ASISTENTE,
  )
  @Get()
  @ApiResponse({ status: 200, description: 'Lista de personas.' })
  async listar(@Request() req: UserRequest) {
    const rol = req.user.rol;

    try {
      return await this.personasService.listar(rol);
    } catch (error) {
      console.error('Error al listar personas:', error);
      throw new InternalServerErrorException(
        `Error al listar personas: ${error.message}`,
      );
    }
  }

  @Get(':id')
  @ApiResponse({ status: 200, description: 'Persona encontrada.' })
  @ApiResponse({ status: 404, description: 'Persona no encontrada.' })
  async findById(@Param('id') id: number) {
    try {
      return await this.personasService.findById(id);
    } catch (error) {
      console.error('Error al encontrar la persona:', error);
      throw new NotFoundException(`Persona con ID ${id} no encontrada.`);
    }
  }

  @Roles(Rol.SUPERADMINISTRADOR, Rol.ADMINISTRADOR)
  @Patch(':id/estado')
  @ApiResponse({
    status: 200,
    description: 'Estado de la persona actualizado.',
  })
  @ApiResponse({ status: 404, description: 'Persona no encontrada.' })
  async changeStatus(
    @Param('id') id: number,
    @Body() cambioEstadoPersonaDto: CambioEstadoPersonaDto,
    @Request() req: UserRequest,
  ) {
    const userId = req.user.id;

    try {
      return await this.personasService.changeStatus(
        id,
        cambioEstadoPersonaDto,
        userId,
      );
    } catch (error) {
      console.error('Error al cambiar el estado de la persona:', error);
      throw new InternalServerErrorException(
        `Error al cambiar el estado de la persona: ${error.message}`,
      );
    }
  }

  @Roles(Rol.SUPERADMINISTRADOR, Rol.ADMINISTRADOR)
  @Patch(':id')
  @ApiResponse({ status: 200, description: 'Persona actualizada.' })
  @ApiResponse({ status: 404, description: 'Persona no encontrada.' })
  async update(
    @Param('id') id: number,
    @Body() updatePersonaDto: UpdatePersonaDto,
    @Request() req: UserRequest,
  ) {
    const userId = req.user.id;

    try {
      return await this.personasService.update(id, updatePersonaDto, userId);
    } catch (error) {
      console.error('Error al actualizar la persona:', error);
      throw new InternalServerErrorException(
        `Error al actualizar la persona: ${error.message}`,
      );
    }
  }
}