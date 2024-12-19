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
import { Roles } from '../auth/roles.decorator';
import { Rol } from '../user_sistemas/entities/user_sistema.entity';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/tuc')
export class TucController {
  constructor(private readonly tucService: TucService) {}

  @Roles(Rol.SUPERADMINISTRADOR, Rol.ADMINISTRADOR)
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
   @Get(':id')
  async findOne(@Param('id') id: number) {
    try {
      return await this.tucService.findOne(id);
    } catch (error) {
      throw new NotFoundException(`Id no encontrado ${id} ${error.message}`);
    }
  }

  @Roles(Rol.ADMINISTRADOR, Rol.SUPERADMINISTRADOR)
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
