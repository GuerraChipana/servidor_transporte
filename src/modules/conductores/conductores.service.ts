import { CambioEstadoConducotoreDto } from './dto/cambioestado-conductore.dto';
import { BadGatewayException, Injectable } from '@nestjs/common';
import { CreateConductoreDto } from './dto/create-conductore.dto';
import { UpdateConductoreDto } from './dto/update-conductore.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { CategoriaLicencia, Conductore } from './entities/conductore.entity';
import { Not, Repository } from 'typeorm';
import { Persona } from 'src/modules/personas/entities/persona.entity'; // Importar la entidad Persona
import { BadRequestException, NotFoundException } from '@nestjs/common'; // Importar BadRequestException y NotFoundException

export interface ConductorConPersona {
  id: number;
  id_persona: {
    nombre: string;
    apellidos: string;
    foto: string;
  };
  n_licencia: string;
  fecha_desde: Date;
  fecha_hasta: Date;
  clase: string;
  categoria: CategoriaLicencia;
  g_sangre: string;
  estado: number;
  id_usuario: number;
  id_usuario_modificacion: number;
  fecha_registro: Date;
  fecha_modificacion: Date;
}

@Injectable()
export class ConductoresService {
  constructor(
    @InjectRepository(Conductore)
    private readonly conductoreRepositorio: Repository<Conductore>,
    @InjectRepository(Persona)
    private readonly personaRepositorio: Repository<Persona>,
  ) {}

  private async validarLicencia(
    createorUpdateDto: CreateConductoreDto | UpdateConductoreDto,
    id?: number,
  ) {
    if (createorUpdateDto.n_licencia) {
      const licenciaExistente = await this.conductoreRepositorio.findOne({
        where: {
          n_licencia: createorUpdateDto.n_licencia,
          id: id ? Not(id) : undefined,
        },
      });
      if (licenciaExistente) {
        throw new BadRequestException('El numero de licencia ya existe');
      }
    }
  }

  // Servicio para crear conductor
  async create(createConductoreDto: CreateConductoreDto, id_usuario: number) {
    const conductorExistente = await this.conductoreRepositorio.findOne({
      where: { id_persona: { id: createConductoreDto.id_persona } },
    });

    if (conductorExistente) {
      throw new BadRequestException(
        `Ya existe un conductor registrado con este id_persona: ${createConductoreDto.id_persona}`,
      );
    }

    const persona = await this.personaRepositorio.findOne({
      where: { id: createConductoreDto.id_persona },
    });

    if (!persona) {
      throw new BadRequestException(
        `No existe una persona con el id_persona: ${createConductoreDto.id_persona}`,
      );
    }
    await this.validarLicencia(createConductoreDto);
    const newconductor = this.conductoreRepositorio.create({
      ...createConductoreDto,
      id_persona: persona,
      id_usuario,
    });
    return await this.conductoreRepositorio.save(newconductor);
  }

  // Servicio para editar
  async update(
    id: number,
    updateConductoreDto: UpdateConductoreDto,
    id_usuario_modificacion: number,
  ): Promise<Conductore> {
    const conduc = await this.conductoreRepositorio.findOne({ where: { id } });
    if (!conduc)
      throw new NotFoundException(`Conductor con ID ${id} no encontrado`);
    await this.validarLicencia(updateConductoreDto, id);
    conduc.id_usuario_modificacion = id_usuario_modificacion;

    const { id_persona, ...resto } = updateConductoreDto;
    Object.assign(conduc, resto);

    return await this.conductoreRepositorio.save(conduc);
  }

  // Servicio para listar todo
  async findAll(): Promise<ConductorConPersona[]> {
    const conductores = await this.conductoreRepositorio.find({
      relations: ['id_persona'],
      select: {
        id_persona: {
          nombre: true,
          apPaterno: true,
          apMaterno: true,
          foto: true,
        },
      },
    });

    return conductores.map((conductor) => {
      return {
        ...conductor,
        id_persona: {
          nombre: conductor.id_persona.nombre,
          apellidos: `${conductor.id_persona.apPaterno} ${conductor.id_persona.apMaterno.charAt(0)}.`,
          foto: conductor.id_persona.foto,
        },
      };
    });
  }

  async findOne(id: number): Promise<ConductorConPersona> {
    const conductor = await this.conductoreRepositorio.findOne({
      where: { id },
      relations: ['id_persona'],
      select: {
        id_persona: {
          nombre: true,
          apPaterno: true,
          apMaterno: true,
          foto: true,
        },
      },
    });

    if (!conductor)
      throw new NotFoundException(`El ID ${id} del conductor no encontrado`);

    return {
      ...conductor,
      id_persona: {
        nombre: conductor.id_persona.nombre,
        apellidos: `${conductor.id_persona.apPaterno} ${conductor.id_persona.apMaterno.charAt(0)}.`, // Solo la inicial del apellido materno
        foto: conductor.id_persona.foto,
      },
    };
  }

  async estado(
    id: number,
    cambioEstadoConducotoreDto: CambioEstadoConducotoreDto,
    id_usuario_modificacion: number,
  ): Promise<Conductore> {
    const cond = await this.conductoreRepositorio.findOne({ where: { id } });
    if (!cond)
      throw new NotFoundException(`EL ID ${id} del conductor no encontrado`);
    cond.estado = cambioEstadoConducotoreDto.estado;
    if (cambioEstadoConducotoreDto.estado === 0) {
      if (!cambioEstadoConducotoreDto.detalle_baja)
        throw new BadGatewayException(
          'Especifica el motivo para desactivar el estado',
        );
      cond.detalle_baja = cambioEstadoConducotoreDto.detalle_baja;
    } else {
      cond.detalle_baja = null;
    }
    cond.id_usuario_modificacion = id_usuario_modificacion;
    return await this.conductoreRepositorio.save(cond);
  }
}
