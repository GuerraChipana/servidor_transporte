import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateEmpadronamientoDto } from './dto/create-empadronamiento.dto';
import { UpdateEmpadronamientoDto } from './dto/update-empadronamiento.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Empadronamiento } from './entities/empadronamiento.entity';
import { Repository } from 'typeorm';
import { Vehiculo } from '../vehiculos/entities/vehiculo.entity';
import { EstadoEmpadronamientoDto } from './dto/estado-empadronamiento.dto';

@Injectable()
export class EmpadronamientoService {
  constructor(
    @InjectRepository(Empadronamiento)
    private readonly empadronaminetoRepo: Repository<Empadronamiento>,

    @InjectRepository(Vehiculo)
    private readonly vehiculoRepo: Repository<Vehiculo>,
  ) {}

  // Validaciones asincronas
  private async Validaciones(
    crearorUpdateDto: CreateEmpadronamientoDto | UpdateEmpadronamientoDto,
    id?: number,
  ) {
    if (crearorUpdateDto.n_empadronamiento) {
      const N_empa_exis = await this.empadronaminetoRepo.findOne({
        where: {
          n_empadronamiento: crearorUpdateDto.n_empadronamiento,
          estado: 1,
        },
      });
      if (N_empa_exis)
        throw new BadRequestException(
          'El numero de empadronamiento ya esta siendo utilizado por otro vehiculo',
        );
    }

    // Validación de vehículo ya empadronado
    if (crearorUpdateDto.id_vehiculo) {
      // Verifica si ya existe un empadronamiento activo para ese vehículo
      const existingEmpadronamiento = await this.empadronaminetoRepo.findOne({
        where: {
          id_vehiculo: { id: crearorUpdateDto.id_vehiculo },
          estado: 1,
        },
      });

      if (existingEmpadronamiento) {
        throw new BadRequestException(
          'Este vehículo ya tiene un empadronamiento activo',
        );
      }

      // Verificación de la existencia y estado del vehículo
      const vehi = await this.vehiculoRepo.findOne({
        where: { id: crearorUpdateDto.id_vehiculo },
      });
      if (!vehi) throw new NotFoundException('El vehiculo no existe');
      if (vehi.estado !== 1)
        throw new BadRequestException('El vehiculo no se encuentra activo');
    }
  }

  async create(
    createEmpadronamientoDto: CreateEmpadronamientoDto,
    id_usuario: number,
  ): Promise<Empadronamiento> {
    await this.Validaciones(createEmpadronamientoDto);

    const vehiculo = await this.vehiculoRepo.findOne({
      where: { id: createEmpadronamientoDto.id_vehiculo },
    });

    const newEmpadro = await this.empadronaminetoRepo.create({
      id_vehiculo: vehiculo,
      n_empadronamiento: createEmpadronamientoDto.n_empadronamiento,
      id_usuario: id_usuario,
    });

    await this.empadronaminetoRepo.save(newEmpadro);
    const empadetall = await this.empadronaminetoRepo.findOne({
      where: { id_empa: newEmpadro.id_empa },
      relations: ['id_vehiculo'],
      select: {
        id_vehiculo: { id: true, placa: true, imagen_url: true },
      },
    });

    return empadetall;
  }

  async update(
    id: number,
    updateEmpadronamientoDto: UpdateEmpadronamientoDto,
    id_modi: number,
  ): Promise<Empadronamiento> {
    const empa = await this.empadronaminetoRepo.findOne({
      where: { id_empa: id, estado: 1 },
    });
    if (!empa)
      throw new NotFoundException('Empadronamiento no se encuentra activo');
    await this.Validaciones(updateEmpadronamientoDto, id);
    (empa.id_usuario_modificacion = id_modi),
      Object.assign(empa, updateEmpadronamientoDto);

    return await this.empadronaminetoRepo.save(empa);
  }

  async estado(
    id: number,
    estadDTo: EstadoEmpadronamientoDto,
    id_modi: number,
  ): Promise<Empadronamiento> {
    const empa = await this.empadronaminetoRepo.findOne({
      where: { id_empa: id },
    });
    if (!empa)
      throw new NotFoundException('Numero de Empadronamiento no encontrado');
    empa.estado = estadDTo.estado;
    if (estadDTo.estado === 0) {
      if (!estadDTo.detalle_baja) {
        throw new BadRequestException(
          'Se requiere dar un detalla del motivo de la baja',
        );
      }
      empa.detalle_baja = estadDTo.detalle_baja;
    } else {
      empa.detalle_baja = null;
    }
    empa.id_usuario_modificacion = id_modi;

    return await this.empadronaminetoRepo.save(empa);
  }

  async findAll(): Promise<Empadronamiento[]> {
    const empa = await this.empadronaminetoRepo.find({
      relations: [
        'id_vehiculo',
        'id_vehiculo.propietario1',
        'id_vehiculo.propietario2',
      ],
      select: {
        id_empa: true,
        n_empadronamiento: true,
        estado: true,
        detalle_baja: true,
        id_vehiculo: {
          id: true,
          placa: true,
          imagen_url: true,
          propietario1: { dni: true, nombre: true },
          propietario2: { dni: true, nombre: true },
        },
      },
    });
    return empa;
  }

  async findOne(id: number): Promise<Empadronamiento> {
    const empa = await this.empadronaminetoRepo.findOne({
      where: { id_empa: id },
      relations: ['id_vehiculo'],
      select: { id_vehiculo: { id: true, placa: true, imagen_url: true } },
    });
    return empa;
  }
}
