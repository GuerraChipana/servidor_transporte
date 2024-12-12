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
        apellidos: `${conductorConVehiculos.id_persona.apPaterno} ${conductorConVehiculos.id_persona.apMaterno.charAt(0)}.`,
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

  // Servicio para editar
  async update(
    id: number,
    updateConductoreDto: UpdateConductoreDto,
    id_usuario_modificacion: number,
  ): Promise<Conductore> {
    // Obtener el conductor con sus detalles (vehículos)
    const conduc = await this.conductoreRepositorio.findOne({
      where: { id, estado: 1 },
      relations: ['detalles', 'detalles.vehiculo'], // Relación con los vehículos
    });

    if (!conduc) {
      throw new NotFoundException(`Conductor con ID ${id} no encontrado.`);
    }

    // Validar que la licencia no esté duplicada
    await this.validarLicencia(updateConductoreDto, id);

    // Eliminar las relaciones de vehículos previas del conductor
    await this.detalleConductoresRepositorio.delete({
      id_conductor: conduc.id,
    });

    // Asignar usuario de modificación
    conduc.id_usuario_modificacion = id_usuario_modificacion;

    // Asignar los valores del DTO de actualización al conductor
    Object.assign(conduc, updateConductoreDto);

    // Guardar la actualización del conductor
    await this.conductoreRepositorio.save(conduc);

    // Si se proporcionan nuevos vehículos, manejamos las relaciones
    if (
      updateConductoreDto.vehiculos &&
      updateConductoreDto.vehiculos.length > 0
    ) {
      // Obtener los vehículos proporcionados por ID
      const vehiculos = await this.vehiculosRepositorio.findByIds(
        updateConductoreDto.vehiculos,
      );

      // Verificar que los vehículos existen
      if (vehiculos.length !== updateConductoreDto.vehiculos.length) {
        throw new BadRequestException('Uno o más vehículos no existen.');
      }

      // Crear nuevas relaciones de vehículos
      const detalles = vehiculos.map((vehiculo) => {
        const detalle = this.detalleConductoresRepositorio.create({
          id_conductor: conduc.id, // El ID del conductor se asigna aquí
          id_vehiculo: vehiculo.id, // El ID del vehículo
          conductor: conduc, // Relación bidireccional
          vehiculo: vehiculo, // Relación bidireccional
        });
        return detalle;
      });

      // Guardar las nuevas relaciones
      await this.detalleConductoresRepositorio.save(detalles);
    }

    // Cargar y devolver el conductor con sus relaciones completas
    const conductorConVehiculos = await this.conductoreRepositorio.findOne({
      where: { id: conduc.id },
      relations: ['detalles', 'detalles.vehiculo', 'id_persona'],
      select: {
        id_persona: {
          dni: true,
          nombre: true,
          apMaterno: true,
          apPaterno: true,
          foto: true,
        },
        detalles: {
          id_conductor: false,
          id_vehiculo: true,
          vehiculo: {
            id: true,
            placa: true,
          },
        },
      },
    });

    return conductorConVehiculos;
  }

  // Método para listar todos los conductores
  async findAll(): Promise<any[]> {
    try {
      const conductores = await this.conductoreRepositorio.find({
        relations: ['detalles', 'detalles.vehiculo', 'id_persona'],
      });

      return conductores.map((conductor) => {
        return {
          id: conductor.id,
          n_licencia: conductor.n_licencia,
          fecha_desde: conductor.fecha_desde,
          fecha_hasta: conductor.fecha_hasta,
          clase: conductor.clase,
          categoria: conductor.categoria,
          restriccion: conductor.restriccion,
          g_sangre: conductor.g_sangre,
          estado: conductor.estado,
          detalle_baja: conductor.detalle_baja,
          id_persona: {
            id: conductor.id_persona.id,
            dni: conductor.id_persona.dni,
            nombre: conductor.id_persona.nombre,
            apellidos: `${conductor.id_persona.apPaterno} ${conductor.id_persona.apMaterno.charAt(0)}.`,
            foto: conductor.id_persona.foto,
          },
          // Vehículos asociados
          vehiculos: conductor.detalles.map((detalle) => ({
            id: detalle.vehiculo.id,
            placa: detalle.vehiculo.placa,
          })),
        };
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al obtener los conductores.',
      );
    }
  }

  // Método para obtener un conductor por ID
  async findOne(id: number): Promise<any> {
    try {
      const conductor = await this.conductoreRepositorio.findOne({
        where: { id },
        relations: ['detalles', 'detalles.vehiculo', 'id_persona'], // Cargar detalles, vehículos y persona
      });

      if (!conductor) {
        throw new NotFoundException(`Conductor con ID ${id} no encontrado.`);
      }

      // Filtrar solo los campos necesarios para la respuesta
      return {
        id: conductor.id,
        n_licencia: conductor.n_licencia,
        fecha_desde: conductor.fecha_desde,
        fecha_hasta: conductor.fecha_hasta,
        clase: conductor.clase,
        categoria: conductor.categoria,
        restriccion: conductor.restriccion,
        g_sangre: conductor.g_sangre,
        estado: conductor.estado,
        detalle_baja: conductor.detalle_baja,
        id_persona: {
          id: conductor.id_persona.id,
          dni: conductor.id_persona.dni,
          nombre: conductor.id_persona.nombre,
          apellidos: `${conductor.id_persona.apPaterno} ${conductor.id_persona.apMaterno.charAt(0)}.`,
          foto: conductor.id_persona.foto,
        },
        // Vehículos asociados
        vehiculos: conductor.detalles.map((detalle) => ({
          id: detalle.vehiculo.id,
          placa: detalle.vehiculo.placa,
        })),
      };
    } catch (error) {
      throw new InternalServerErrorException('Error al obtener el conductor.');
    }
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
