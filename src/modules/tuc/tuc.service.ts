import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateTucDto } from './dto/create-tuc.dto';
import { UpdateTucDto } from './dto/update-tuc.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Tuc } from './entities/tuc.entity';
import { Not, Repository } from 'typeorm';
import { Asociacione } from '../asociaciones/entities/asociacione.entity';
import { Vehiculo } from '../vehiculos/entities/vehiculo.entity';
import { EstadoDtoTuc } from './dto/estado-tuc.dto';

@Injectable()
export class TucService {
  constructor(
    @InjectRepository(Tuc)
    private readonly tucRepositorio: Repository<Tuc>,
    @InjectRepository(Asociacione)
    private readonly asociacionRepositorio: Repository<Asociacione>,
    @InjectRepository(Vehiculo)
    private readonly vehiculoRepositorio: Repository<Vehiculo>,
  ) {}

  // Validaciones
  private async validaciones(
    createorUpdatedto: CreateTucDto | UpdateTucDto,
    id?: number,
  ) {
    if (createorUpdatedto.n_tuc && createorUpdatedto.ano_tuc) {
      const num_tuc = await this.tucRepositorio.findOne({
        where: {
          n_tuc: createorUpdatedto.n_tuc,
          ano_tuc: createorUpdatedto.ano_tuc,
          id_tuc: id ? Not(id) : undefined,
        },
      });
      if (num_tuc)
        throw new BadGatewayException(
          'El numero de tuc ya existe con este año',
        );
    }

    if (createorUpdatedto.id_asociacion) {
      const asoci = await this.asociacionRepositorio.findOne({
        where: { id: createorUpdatedto.id_asociacion },
      });
      if (!asoci) throw new NotFoundException('La asociacion no existe');
      if (asoci.estado !== 1)
        throw new BadRequestException('La asociacion no esta activa');
    }

    if (createorUpdatedto.id_vehiculo) {
      const vehi = await this.vehiculoRepositorio.findOne({
        where: { id: createorUpdatedto.id_vehiculo },
      });
      if (!vehi) throw new NotFoundException('El vehiculo no existe');
      if (vehi.estado !== 1)
        throw new BadRequestException('El vehiculo no esta activo');
    }
  }

  async create(id_usuario: number, createTucDTO: CreateTucDto) {
    await this.validaciones(createTucDTO);
    const asociancion = await this.asociacionRepositorio.findOne({
      where: { id: createTucDTO.id_asociacion },
    });
    const vehiculo = await this.vehiculoRepositorio.findOne({
      where: { id: createTucDTO.id_vehiculo },
    });
    const nuevoTUC = this.tucRepositorio.create({
      id_asociacion: asociancion,
      id_vehiculo: vehiculo,
      ano_tuc: createTucDTO.ano_tuc,
      n_tuc: createTucDTO.n_tuc,
      fecha_desde: createTucDTO.fecha_desde,
      id_usuario: id_usuario,
    });

    await this.tucRepositorio.save(nuevoTUC);

    // Obtener el detalle del TUC recién creado
    const TucDetall = await this.tucRepositorio.findOne({
      where: { id_tuc: nuevoTUC.id_tuc },
      relations: ['id_asociacion', 'id_vehiculo'],
      select: {
        id_tuc: true,
        n_tuc: true,
        ano_tuc: true,
        fecha_desde: true,
        fecha_hasta: true,
        estado_vigencia: true,
        estado: true,
        detalle_baja: true,
        id_asociacion: { id: true, nombre: true },
        id_vehiculo: { id: true, placa: true, imagen_url: true },
      },
    });

    return TucDetall;
  }

  async update(
    id: number,
    updatetucdto: UpdateTucDto,
    id_usuario_modificacion: number,
  ): Promise<Tuc> {
    const modiTuc = await this.tucRepositorio.findOne({
      where: { id_tuc: id, estado: 1 },
      relations: ['id_asociacion', 'id_vehiculo'],
    });
    if (!modiTuc)
      throw new NotFoundException(`EL TUC con ID ${id} esta inactivo`);
    await this.validaciones(updatetucdto, id);
    modiTuc.id_usuario_modificacion = id_usuario_modificacion;

    Object.assign(modiTuc, updatetucdto);

    await this.tucRepositorio.save(modiTuc);

    const TucDetall = await this.tucRepositorio.findOne({
      where: { id_tuc: modiTuc.id_tuc },
      relations: ['id_asociacion', 'id_vehiculo'],
      select: {
        id_tuc: true,
        n_tuc: true,
        ano_tuc: true,
        fecha_desde: true,
        fecha_hasta: true,
        estado_vigencia: true,
        estado: true,
        detalle_baja: true,
        id_asociacion: { id: true, nombre: true },
        id_vehiculo: { id: true, placa: true, imagen_url: true },
      },
    });

    return TucDetall;
  }

  async findAll(): Promise<Tuc[]> {
    const vehiSeg = await this.tucRepositorio.find({
      relations: ['id_asociacion', 'id_vehiculo'],
      select: {
        id_tuc: true,
        n_tuc: true,
        ano_tuc: true,
        fecha_desde: true,
        fecha_hasta: true,
        estado_vigencia: true,
        estado: true,
        detalle_baja: true,
        id_asociacion: { id: true, nombre: true },
        id_vehiculo: { id: true, placa: true, imagen_url: true },
      },
    });
    return vehiSeg;
  }

  async findOne(id: number): Promise<Tuc> {
    const tuc = await this.tucRepositorio.findOne({
      where: { id_tuc: id },
      relations: ['id_asociacion', 'id_vehiculo'],
      select: {
        id_tuc: true,
        n_tuc: true,
        ano_tuc: true,
        fecha_desde: true,
        fecha_hasta: true,
        estado_vigencia: true,
        estado: true,
        detalle_baja: true,
        id_asociacion: { id: true, nombre: true },
        id_vehiculo: { id: true, placa: true, imagen_url: true },
      },
    });
    if (!tuc) {
      throw new BadRequestException('Tuc no encontrado');
    }
    return tuc;
  }

  async estado(
    id_tuc: number,
    estadoDtoTuc: EstadoDtoTuc,
    id_modi: number,
  ): Promise<Tuc> {
    const tuc = await this.tucRepositorio.findOne({
      where: { id_tuc },
    });
    if (!tuc) throw new NotFoundException(`El Tuc con Id ${id_tuc} no existe`);
    tuc.estado = estadoDtoTuc.estado;
    if (estadoDtoTuc.estado === 0) {
      if (!estadoDtoTuc.detalle_baja) {
        throw new BadRequestException('Se requiere dar el detalle del motivo');
      }
      tuc.detalle_baja = estadoDtoTuc.detalle_baja;
    } else {
      tuc.detalle_baja = null;
    }
    tuc.id_usuario_modificacion = id_modi;
    return await this.tucRepositorio.save(tuc);
  }
}
