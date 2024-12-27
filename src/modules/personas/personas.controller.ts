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
  BadGatewayException,
} from '@nestjs/common';
import { PersonaService } from './personas.service';
// import { CreatePersonaDto } from './dto/create-persona.dto'; // Asegúrate de importar el DTO
import { JwtAuthGuard } from '../auth/jwt.auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Rol } from '../user_sistemas/entities/user_sistema.entity';
import { UpdatePersonaDto } from './dto/update-persona.dto';
import { CambioEstadoPersonaDto } from './dto/estado-persona.dto';
import { UserRequestRequest } from 'src/modules/user-request.Request';
import { BuscarPersonaDto } from './dto/buscar-persona.dto';
import { CreatePersonaDto } from './dto/create-persona.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/personas')
export class PersonasController {
  constructor(private readonly personasService: PersonaService) {}

  @Roles(Rol.SUPERADMINISTRADOR, Rol.ADMINISTRADOR)
  @Post('buscar')
  async buscar(
    @Body() buscarPersonaDto: BuscarPersonaDto,
    @Request() req: UserRequestRequest,
  ) {
    const userId = req.user.id;

    try {
      return await this.personasService.consultarPersona(
        buscarPersonaDto,
        userId,
      );
    } catch (error) {
      throw new InternalServerErrorException(
        `Error al buscar la persona: ${error.message}`,
      );
    }
  }

  @Roles(Rol.ADMINISTRADOR, Rol.SUPERADMINISTRADOR)
  @Post('crear')
  async create(
    @Body() createPersonaDto: CreatePersonaDto,
    @Request() req: UserRequestRequest,
  ) {
    const userId = req.user.id;

    try {
      return await this.personasService.crearPersona(createPersonaDto, userId);
    } catch (error) {
      throw new BadGatewayException(
        `Error al crear la persona ${error.message}`,
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
  async listar(@Request() req: UserRequestRequest) {
    const rol = req.user.rol;

    try {
      return await this.personasService.listar(rol);
    } catch (error) {
      throw new InternalServerErrorException(
        `Error al listar personas: ${error.message}`,
      );
    }
  }

  @Roles(
    Rol.SUPERADMINISTRADOR,
    Rol.ADMINISTRADOR,
    Rol.MODERADOR,
    Rol.ASISTENTE,
  )
  @Get(':id')
  async findById(@Param('id') id: number) {
    try {
      return await this.personasService.findById(id);
    } catch (error) {
      throw new NotFoundException(`Persona con ID ${id} no encontrada.`);
    }
  }

  @Roles(Rol.SUPERADMINISTRADOR, Rol.ADMINISTRADOR)
  @Patch(':id/estado')
  async changeStatus(
    @Param('id') id: number,
    @Body() cambioEstadoPersonaDto: CambioEstadoPersonaDto,
    @Request() req: UserRequestRequest,
  ) {
    const userId = req.user.id;

    try {
      return await this.personasService.changeStatus(
        id,
        cambioEstadoPersonaDto,
        userId,
      );
    } catch (error) {
      throw new InternalServerErrorException(
        `Error al cambiar el estado de la persona: ${error.message}`,
      );
    }
  }

  @Roles(Rol.SUPERADMINISTRADOR, Rol.ADMINISTRADOR)
  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() updatePersonaDto: UpdatePersonaDto,
    @Request() req: UserRequestRequest,
  ) {
    const userId = req.user.id;

    try {
      return await this.personasService.update(id, updatePersonaDto, userId);
    } catch (error) {
      throw new InternalServerErrorException(
        `Error al actualizar la persona: ${error.message}`,
      );
    }
  }
}
