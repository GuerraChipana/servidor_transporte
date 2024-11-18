import {
  BadGatewayException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, In } from 'typeorm';
import { CategoriaLicencia, Conductore } from './entities/conductore.entity';
import { Persona } from 'src/modules/personas/entities/persona.entity';
import { BadRequestException } from '@nestjs/common';
import { CreateConductoreDto } from './dto/create-conductore.dto';
import { DetalleConductore } from 'src/modules/detalle_conductores/entities/detalle_conductore.entity';
import { Vehiculo } from 'src/modules/vehiculos/entities/vehiculo.entity';
import { CambioEstadoConducotoreDto } from './dto/cambioestado-conductore.dto';
import { UpdateConductoreDto } from './dto/update-conductore.dto';

export interface ConductorConPersona {
  id: number;
  id_persona: {
    id: number;
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
    @InjectRepository(DetalleConductore)
    private readonly detalleConductoresRepositorio: Repository<DetalleConductore>,
    @InjectRepository(Vehiculo)
    private readonly vehiculosRepositorio: Repository<Vehiculo>,
  ) {}

  // Validar si la licencia ya está registrada
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
    // Verificar si ya existe un conductor con esta persona
    const conductorExistente = await this.conductoreRepositorio.findOne({
      where: { id_persona: { id: createConductoreDto.id_persona } },
    });

    if (conductorExistente) {
      throw new BadRequestException(
        `Ya existe un conductor registrado con este id_persona: ${createConductoreDto.id_persona}`,
      );
    }

    // Verificar si la persona existe
    const persona = await this.personaRepositorio.findOne({
      where: { id: createConductoreDto.id_persona },
    });

    if (!persona) {
      throw new BadRequestException(
        `No existe una persona con el id_persona: ${createConductoreDto.id_persona}`,
      );
    }

    // Validar que el número de licencia no esté duplicado
    await this.validarLicencia(createConductoreDto);

    // Crear el conductor
    const newConductor = this.conductoreRepositorio.create({
      ...createConductoreDto,
      id_persona: persona,
      id_usuario,
    });

    // Guardar el conductor
    const savedConductor = await this.conductoreRepositorio.save(newConductor);

    // Si hay vehículos asociados, agregar las relaciones en la tabla puente
    if (
      createConductoreDto.vehiculos &&
      createConductoreDto.vehiculos.length > 0
    ) {
      const vehiculos = await this.vehiculosRepositorio.findByIds(
        createConductoreDto.vehiculos,
      );

      // Verificamos si todos los vehículos existen
      if (vehiculos.length !== createConductoreDto.vehiculos.length) {
        throw new BadRequestException('Uno o más vehículos no existen.');
      }

      // Crear entradas en la tabla puente `detalle_conductores`
      const detalles = vehiculos.map((vehiculo) => {
        const detalle = this.detalleConductoresRepositorio.create({
          id_conductor: savedConductor.id,

          id_vehiculo: vehiculo.id,
          conductor: savedConductor, // Relación bidireccional
          vehiculo: vehiculo, // Relación bidireccional
        });
        return detalle;
      });

      // Guardar las relaciones
      await this.detalleConductoresRepositorio.save(detalles);
    }

    // Cargar el conductor con los vehículos asociados
    const conductorConVehiculos = await this.conductoreRepositorio.findOne({
      where: { id: savedConductor.id },
      relations: ['detalles', 'detalles.vehiculo', 'id_persona'], // Cargar detalles y vehículos asociados
    });

    // Formatear la respuesta para incluir solo los vehículos relevantes
    const conductorResponse = {
      ...conductorConVehiculos,
      id_persona: {
        id: conductorConVehiculos.id_persona.id,
        nombre: conductorConVehiculos.id_persona.nombre,
        apellidos: `${conductorConVehiculos.id_persona.apPaterno}+${conductorConVehiculos.id_persona.apMaterno.charAt(0)}`,
        foto: conductorConVehiculos.id_persona.foto,
      },
      vehiculos: conductorConVehiculos.detalles.map((detalle) => ({
        id: detalle.vehiculo.id,
        placa: detalle.vehiculo.placa,
      })),
    };

    // Eliminar la propiedad `detalles` que no se necesita en la respuesta final
    delete conductorResponse.detalles;

    return conductorResponse;
  }

  async asociarVehiculosConductor(
    idConductor: number,
    vehiculosIds: number[], // Array de IDs de vehículos
  ) {
    if (!Array.isArray(vehiculosIds)) {
      throw new BadRequestException('vehiculosIds debe ser un array.');
    }
    if (vehiculosIds.length === 0) {
      throw new BadRequestException(
        'Se debe proporcionar al menos un ID de vehículo.',
      );
    }
    if (!idConductor || idConductor <= 0 || isNaN(idConductor)) {
      throw new BadRequestException('ID del conductor no válido');
    }

    let conductor;
    try {
      conductor = await this.conductoreRepositorio.findOne({
        where: { id: idConductor },
        relations: ['detalles', 'detalles.vehiculo'],
      });
      if (!conductor)
        throw new NotFoundException(
          `Conductor con ID ${idConductor} no encontrado`,
        );
    } catch (error) {
      throw new NotFoundException(
        `Conductor con ID ${idConductor} no encontrado`,
      );
    }

    let vehiculos;
    try {
      vehiculos = await this.vehiculosRepositorio.find({
        where: { id: In(vehiculosIds) },
      });
    } catch (error) {
      throw new BadRequestException('Error al buscar los vehículos.');
    }

    if (vehiculos.length !== vehiculosIds.length) {
      const vehiculosNoEncontrados = vehiculosIds.filter(
        (id) => !vehiculos.some((v) => v.id === id),
      );
      throw new BadRequestException(
        `Los siguientes vehículos no existen: ${vehiculosNoEncontrados.join(', ')}`,
      );
    }

    try {
      await this.detalleConductoresRepositorio.delete({
        id_conductor: idConductor,
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al eliminar las relaciones de vehículos existentes',
      );
    }

    const nuevasRelaciones = [];
    for (const vehiculo of vehiculos) {
      if (vehiculo.estado !== 1) {
        continue;
      }

      // Crear la nueva relación
      const nuevaRelacion = this.detalleConductoresRepositorio.create({
        id_conductor: idConductor, // Aseguramos que se asigna correctamente el id_conductor
        id_vehiculo: vehiculo.id, // Aseguramos que se asigna correctamente el id_vehiculo
        conductor: conductor, // Relación bidireccional con conductor
        vehiculo: vehiculo, // Relación bidireccional con vehículo
      });

      nuevasRelaciones.push(nuevaRelacion);
    }
    if (nuevasRelaciones.length > 0) {
      try {
        await this.detalleConductoresRepositorio.save(nuevasRelaciones);
      } catch (error) {
        throw new InternalServerErrorException(
          'Error al guardar las relaciones',
        );
      }
    }

    // Recuperar el conductor con los vehículos asociados
    let conductorConVehiculos;
    try {
      conductorConVehiculos = await this.conductoreRepositorio.findOne({
        where: { id: conductor.id },
        relations: ['detalles', 'detalles.vehiculo'],
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al recuperar los vehículos asociados.',
      );
    }

    if (!conductorConVehiculos) {
      throw new InternalServerErrorException(
        'Error al recuperar los vehículos asociados.',
      );
    }

    const conductorResponse = {
      ...conductorConVehiculos,
      vehiculos: conductorConVehiculos.detalles.map((detalle) => ({
        id: detalle.vehiculo.id,
        placa: detalle.vehiculo.placa,
      })),
    };

    delete conductorResponse.detalles;

    return conductorResponse;
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
          id: conductor.id,
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
        id: conductor.id,
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
