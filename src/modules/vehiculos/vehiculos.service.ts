import { ImagenesService } from '../imagenes/imagenes.service';
import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateVehiculoDto } from './dto/create-vehiculo.dto';
import { UpdateVehiculoDto } from './dto/update-vehiculo.dto';
import { Vehiculo } from './entities/vehiculo.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Not, Repository } from 'typeorm';
import { Persona } from '../personas/entities/persona.entity';
import { CambioEstadoVehiculoDto } from './dto/cambioestado-vehiculo.dto';

export class VehiculoResponseDto {
  id: number;
  imagen_url: string;
  placa: string;
  n_tarjeta: string;
  n_motor: string;
  marca: string;
  color: string;
  ano_de_compra: number;
  propietario1: {
    id: number;
    dni: string;
    nombre: string;
  } | null;
  propietario2: {
    id: number;
    dni: string;
    nombre: string;
  } | null;
  estado: number;
  detalle_baja: string;
  id_usuario: number;
  id_usuario_modificacion: number;
  fecha_registro: Date;
  fecha_modificacion: Date;
}

@Injectable()
export class VehiculosService {
  constructor(
    @InjectRepository(Vehiculo)
    private readonly vehiculoRepository: Repository<Vehiculo>,
    @InjectRepository(Persona)
    private readonly personaRepositorio: Repository<Persona>,
    private readonly imagenesService: ImagenesService,
  ) {}

  private async validaciones(
    createORUpdateDto: CreateVehiculoDto | UpdateVehiculoDto,
    id?: number,
  ) {
    // Definir los campos a verificar
    const fieldsToCheck = [
      { field: 'placa', message: 'El numero de placa ya existe' },
      { field: 'n_motor', message: 'El numero de motor ya existe' },
      { field: 'n_tarjeta', message: 'El numero de tarjeta ya existe' },
    ];

    // Recorrer cada campo y validar si existe
    for (const { field, message } of fieldsToCheck) {
      if (createORUpdateDto[field]) {
        const existingRecord = await this.vehiculoRepository.findOne({
          where: {
            [field]: createORUpdateDto[field],
            id: id ? Not(id) : undefined,
          },
        });

        // Si el campo ya existe, lanzamos una excepción
        if (existingRecord) {
          throw new BadRequestException(message);
        }
      }
    }
  }

  // Método para crear un vehículo
  async create(
    createVehiculoDto: CreateVehiculoDto,
    id_usuario: number,
    file: Express.Multer.File,
  ): Promise<Vehiculo> {
    if (!createVehiculoDto.propietario1) {
      throw new BadRequestException('El propietario 1 es obligatorio');
    }
    if (
      createVehiculoDto.propietario2 &&
      createVehiculoDto.propietario1 === createVehiculoDto.propietario2
    ) {
      throw new BadRequestException('Los propietarios no pueden ser iguales');
    }

    const pro1 = await this.personaRepositorio.findOne({
      where: { id: createVehiculoDto.propietario1 },
    });
    const pro2 = await this.personaRepositorio.findOne({
      where: { id: createVehiculoDto.propietario2 },
    });

    if (pro1 && pro1.estado === 0) {
      throw new BadRequestException(
        `El propietario ${pro1.nombre} no se encuentra activo`,
      );
    }
    if (pro2 && pro2.estado === 0) {
      throw new BadRequestException(
        `El propietario ${pro2.nombre} no se encuentra activo`,
      );
    }

    await this.validaciones(createVehiculoDto);

    let imagenURL: string | undefined;
    if (file) {
      try {
        imagenURL = await this.imagenesService.subirFileNormal(
          file,
          `vehiculo_${createVehiculoDto.placa}`,
          'vehiculos',
        );
      } catch (error) {
        throw new BadRequestException(
          'Error al subir la imagen:  ' + error.message,
        );
      }
    }
    // Creamos el vehículo con las instancias completas de los propietarios
    const vehiculo = this.vehiculoRepository.create({
      ...createVehiculoDto,
      propietario1: pro1,
      propietario2: pro2,
      imagen_url: imagenURL,
      id_usuario,
    });

    return await this.vehiculoRepository.save(vehiculo);
  }

  // Método para actualizar un vehículo
  async update(
    id: number,
    updateVehiculoDto: UpdateVehiculoDto,
    file: Express.Multer.File,
    id_usuario_modicicacion: number,
  ): Promise<Vehiculo> {
    // Recuperar el vehículo actual de la base de datos con las relaciones de propietario
    const vehiculo = await this.vehiculoRepository.findOne({
      where: { id, estado: 1 },
      relations: ['propietario1', 'propietario2'],
    });
    if (!vehiculo) {
      throw new BadRequestException(
        `El vehiculo con ID ${id} no se encuentra activo`,
      );
    }

    // Verificar si los propietarios existen en la base de datos y asignarlos correctamente
    if (updateVehiculoDto.propietario1) {
      const propietario1 = await this.personaRepositorio.findOne({
        where: { id: updateVehiculoDto.propietario1 },
      });
      if (!propietario1) {
        throw new BadRequestException(
          `No existe una persona con el id: ${updateVehiculoDto.propietario1}`,
        );
      }
      vehiculo.propietario1 = propietario1; // Asignar la instancia de Persona, no solo el ID
    }

    if (updateVehiculoDto.propietario2) {
      const propietario2 = await this.personaRepositorio.findOne({
        where: { id: updateVehiculoDto.propietario2 },
      });
      if (!propietario2) {
        throw new BadRequestException(
          `No existe una persona con el id: ${updateVehiculoDto.propietario2}`,
        );
      }
      vehiculo.propietario2 = propietario2; // Asignar la instancia de Persona
    }

    // Validaciones de campos como placa, número de motor, número de tarjeta (si se actualizan)
    await this.validaciones(updateVehiculoDto, id);

    // Si la placa NO cambia pero la imagen sí
    let imagenURL: string | undefined;

    if (file) {
      try {
        // Eliminar la imagen anterior si existe
        if (vehiculo.imagen_url) {
          const oldImageName = vehiculo.imagen_url.split('/').pop();
          if (oldImageName) {
            await this.imagenesService.eliminarImagen(
              oldImageName,
              'vehiculos',
            );
          }
        }

        imagenURL = await this.imagenesService.subirFileNormal(
          file,
          `vehiculo_${vehiculo.placa}`, // Usamos la placa actual para el nombre de la imagen
          'vehiculos', // carpeta 'vehiculos' dentro de 'imagenes'
        );
      } catch (error) {
        throw new BadRequestException(
          'Error al subir la imagen: ' + error.message,
        );
      }
    }

    const updatedVehiculo = this.vehiculoRepository.merge(vehiculo, {
      ...updateVehiculoDto,
      propietario1: vehiculo.propietario1,
      propietario2: vehiculo.propietario2,
      imagen_url: imagenURL || vehiculo.imagen_url,
      id_usuario_modificacion: id_usuario_modicicacion,
    });

    // Guardamos el vehículo actualizado
    return await this.vehiculoRepository.save(updatedVehiculo);
  }

  // Método para listar vehículos
  async findAll(): Promise<VehiculoResponseDto[]> {
    const vehiculos = await this.vehiculoRepository.find({
      relations: ['propietario1', 'propietario2'],
      select: {
        propietario1: { id: true, dni: true, nombre: true },
        propietario2: { id: true, dni: true, nombre: true },
      },
    });

    return vehiculos.map((vehiculo) => {
      return {
        id: vehiculo.id,
        imagen_url: vehiculo.imagen_url,
        placa: vehiculo.placa,
        n_tarjeta: vehiculo.n_tarjeta,
        n_motor: vehiculo.n_motor,
        marca: vehiculo.marca,
        color: vehiculo.color,
        ano_de_compra: vehiculo.ano_de_compra,
        propietario1: vehiculo.propietario1
          ? {
              id: vehiculo.propietario1.id,
              dni: vehiculo.propietario1.dni,
              nombre: vehiculo.propietario1.nombre,
            }
          : null,
        propietario2: vehiculo.propietario2
          ? {
              id: vehiculo.propietario2.id,
              dni: vehiculo.propietario2.dni,
              nombre: vehiculo.propietario2.nombre,
            }
          : null,
        estado: vehiculo.estado,
        detalle_baja: vehiculo.detalle_baja,
        id_usuario: vehiculo.id_usuario,
        id_usuario_modificacion: vehiculo.id_usuario_modificacion,
        fecha_registro: vehiculo.fecha_registro,
        fecha_modificacion: vehiculo.fecha_modificacion,
      };
    });
  }

  // Método para buscar un vehículo
  async findOne(id: number): Promise<VehiculoResponseDto> {
    // Buscar el vehículo por su ID con las relaciones de los propietarios
    const vehiculo = await this.vehiculoRepository.findOne({
      where: { id },
      relations: ['propietario1', 'propietario2'],
      select: {
        propietario1: { id: true, dni: true, nombre: true },
        propietario2: { id: true, dni: true, nombre: true },
      },
    });

    // Si no se encuentra el vehículo, lanzamos una excepción
    if (!vehiculo) {
      throw new BadRequestException('Vehículo no encontrado');
    }

    // Retornar el vehículo con los datos formateados
    return {
      id: vehiculo.id,
      imagen_url: vehiculo.imagen_url,
      placa: vehiculo.placa,
      n_tarjeta: vehiculo.n_tarjeta,
      n_motor: vehiculo.n_motor,
      marca: vehiculo.marca,
      color: vehiculo.color,
      ano_de_compra: vehiculo.ano_de_compra,
      propietario1: vehiculo.propietario1
        ? {
            id: vehiculo.propietario1.id,
            dni: vehiculo.propietario1.dni,
            nombre: vehiculo.propietario1.nombre,
          }
        : null,
      propietario2: vehiculo.propietario2
        ? {
            id: vehiculo.propietario2.id,
            dni: vehiculo.propietario2.dni,
            nombre: vehiculo.propietario2.nombre,
          }
        : null,
      estado: vehiculo.estado,
      detalle_baja: vehiculo.detalle_baja,
      id_usuario: vehiculo.id_usuario,
      id_usuario_modificacion: vehiculo.id_usuario_modificacion,
      fecha_registro: vehiculo.fecha_registro,
      fecha_modificacion: vehiculo.fecha_modificacion,
    };
  }

  // Metodo para cambiar estado de vehiculo
  async estado(
    id: number,
    cambioEstadoVehiculoDto: CambioEstadoVehiculoDto,
    id_usuario_modificacion: number,
  ): Promise<Vehiculo> {
    const vehi = await this.vehiculoRepository.findOne({ where: { id } });
    if (!vehi)
      throw new NotFoundException(`El ID ${id} del vehiculo no encontrado`);
    vehi.estado = cambioEstadoVehiculoDto.estado;
    if (cambioEstadoVehiculoDto.estado === 0) {
      // Si no se proporciona un motivo para desactivar el estado, lanzamos la excepción
      if (!cambioEstadoVehiculoDto.detalle_baja) {
        throw new BadGatewayException(
          'Especifica el motivo para desactivar el estado',
        );
      }
      // Si se proporciona un motivo, asignamos el detalle de baja
      vehi.detalle_baja = cambioEstadoVehiculoDto.detalle_baja;
    } else {
      vehi.detalle_baja = null;
    }

    vehi.id_usuario_modificacion = id_usuario_modificacion;
    return await this.vehiculoRepository.save(vehi);
  }
}
