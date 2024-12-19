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
} from '@nestjs/common';
import { EmpadronamientoService } from './empadronamiento.service';
import { CreateEmpadronamientoDto } from './dto/create-empadronamiento.dto';
import { UpdateEmpadronamientoDto } from './dto/update-empadronamiento.dto';
import { UserRequestRequest } from '../user-request.Request';
import { JwtAuthGuard } from '../auth/jwt.auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { EstadoEmpadronamientoDto } from './dto/estado-empadronamiento.dto';
import { Roles } from '../auth/roles.decorator';
import { Rol } from '../user_sistemas/entities/user_sistema.entity';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/empadronamiento')
export class EmpadronamientoController {
  constructor(
    private readonly empadronamientoService: EmpadronamientoService,
  ) {}

  @Roles(Rol.SUPERADMINISTRADOR, Rol.ADMINISTRADOR)
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
  @Get(':id')
  async findOne(@Param('id') id: number) {
    try {
      return await this.empadronamientoService.findOne(id);
    } catch (error) {
      throw new InternalServerErrorException(`${error.message}`);
    }
  }

  @Roles(Rol.ADMINISTRADOR, Rol.SUPERADMINISTRADOR)
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
