import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateVehiculoSeguroDto } from './dto/create-vehiculo-seguro.dto';
import { UpdateVehiculoSeguroDto } from './dto/update-vehiculo-seguro.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Vehiculo } from '../vehiculos/entities/vehiculo.entity';
import { Repository, Not } from 'typeorm';
import {
  EstadoVencimiento,
  VehiculoSeguro,
} from './entities/vehiculo-seguro.entity';
import { Aseguradora } from '../aseguradoras/entities/aseguradora.entity';
import { isBefore } from 'date-fns';
import { CambioEstadoSeguroVehiculoDto } from './dto/cambioestado-conductore.dto';

@Injectable()
export class VehiculoSegurosService {
  constructor(
    @InjectRepository(Aseguradora)
    private readonly aseguradoraRepositorio: Repository<Aseguradora>,
    @InjectRepository(Vehiculo)
    private readonly vehiculoRepositorio: Repository<Vehiculo>,
    @InjectRepository(VehiculoSeguro)
    private readonly vehiculoSeguroRepositorio: Repository<VehiculoSeguro>,
  ) {}

  private actualizarEstadoVencimiento(
    fechaVigenciaHasta: Date,
  ): EstadoVencimiento {
    const fechaActual = new Date();
    if (isBefore(fechaVigenciaHasta, fechaActual)) {
      return EstadoVencimiento.VENCIDO;
    } else {
      return EstadoVencimiento.NO_VENCIDO;
    }
  }
  private async Validaciones(
    createOrUpdateDto: CreateVehiculoSeguroDto | UpdateVehiculoSeguroDto,
    id?: number,
  ) {
    // Validación del número de póliza
    if (createOrUpdateDto.n_poliza) {
      const npol = await this.vehiculoSeguroRepositorio.findOne({
        where: {
          n_poliza: createOrUpdateDto.n_poliza,
          id_vehseg: id ? Not(id) : undefined,
        },
      });
      if (npol) throw new BadRequestException('El número de póliza ya existe');
    }

    // Validación de aseguradora
    if (createOrUpdateDto.id_aseguradora) {
      const aseg = await this.aseguradoraRepositorio.findOne({
        where: { id: createOrUpdateDto.id_aseguradora },
      });
      if (!aseg) throw new NotFoundException('La aseguradora no existe');
      if (aseg.estado !== 1)
        throw new BadRequestException('La aseguradora no está activa');
    }

    // Validación de vehículo
    if (!createOrUpdateDto.id_vehiculo) {
      throw new BadRequestException('El id_vehiculo no puede estar vacío');
    }
    const vehi = await this.vehiculoRepositorio.findOne({
      where: { id: createOrUpdateDto.id_vehiculo },
    });
    if (!vehi) throw new NotFoundException('El vehículo no existe');
    if (vehi.estado !== 1) {
      throw new BadRequestException('El vehículo está inactivo');
    }

    // Validación de fechas
    if (
      createOrUpdateDto.fecha_vigencia_hasta &&
      createOrUpdateDto.fecha_vigencia_desde
    ) {
      // Convertir las fechas a objetos Date utilizando parseISO
      const fechaHasta = createOrUpdateDto.fecha_vigencia_hasta;
      const fechaDesde = createOrUpdateDto.fecha_vigencia_desde;

      // Comparar las fechas
      if (isBefore(fechaHasta, fechaDesde)) {
        throw new BadRequestException(
          'La fecha de vigencia hasta debe ser mayor que la fecha de vigencia desde',
        );
      }
    }
  }
  async create(
    createVehiculoSeguroDto: CreateVehiculoSeguroDto,
    id_usuario: number,
  ): Promise<VehiculoSeguro> {
    await this.Validaciones(createVehiculoSeguroDto);

    // Obtener aseguradora y vehículo
    const aseguradora = await this.aseguradoraRepositorio.findOne({
      where: { id: createVehiculoSeguroDto.id_aseguradora },
    });
    const vehiculo = await this.vehiculoRepositorio.findOne({
      where: { id: createVehiculoSeguroDto.id_vehiculo },
    });

    // Crear la nueva entidad VehiculoSeguro
    const newVehiSeguro = this.vehiculoSeguroRepositorio.create({
      id_aseguradora: aseguradora,
      id_vehiculo: vehiculo,
      n_poliza: createVehiculoSeguroDto.n_poliza,
      fecha_vigencia_desde: createVehiculoSeguroDto.fecha_vigencia_desde,
      fecha_vigencia_hasta: createVehiculoSeguroDto.fecha_vigencia_hasta,
      id_usuario,
      estado_vencimiento: this.actualizarEstadoVencimiento(
        createVehiculoSeguroDto.fecha_vigencia_hasta,
      ),
    });

    await this.vehiculoSeguroRepositorio.save(newVehiSeguro);

    // Obtener y devolver el detalle del seguro creado
    const Segurodetall = await this.vehiculoSeguroRepositorio.findOne({
      where: { id_vehseg: newVehiSeguro.id_vehseg },
      relations: ['id_aseguradora', 'id_vehiculo'],
      select: {
        id_vehseg: true,
        n_poliza: true,
        fecha_vigencia_desde: true,
        fecha_vigencia_hasta: true,
        id_aseguradora: {
          id: true,
          aseguradora: true,
        },
        id_vehiculo: {
          id: true,
          placa: true,
          imagen_url: true,
        },
      },
    });

    return Segurodetall;
  }

  async update(
    id: number,
    updateVehiculoSeguroDto: UpdateVehiculoSeguroDto,
    id_usuario_modificacion: number,
  ): Promise<VehiculoSeguro> {
    const vehiculoSeguro = await this.vehiculoSeguroRepositorio.findOne({
      where: { id_vehseg: id, estado: 1 },
      relations: ['id_aseguradora', 'id_vehiculo'],
    });
    if (!vehiculoSeguro) {
      throw new NotFoundException(`Seguro con ID ${id} inactivo`);
    }

    await this.Validaciones(updateVehiculoSeguroDto, id);

    vehiculoSeguro.estado_vencimiento = this.actualizarEstadoVencimiento(
      updateVehiculoSeguroDto.fecha_vigencia_hasta,
    );

    vehiculoSeguro.id_usuario_modificacion = id_usuario_modificacion;
    Object.assign(vehiculoSeguro, updateVehiculoSeguroDto);
    await this.vehiculoSeguroRepositorio.save(vehiculoSeguro);
    const seguroDetall = await this.vehiculoSeguroRepositorio.findOne({
      where: { id_vehseg: vehiculoSeguro.id_vehseg },
      relations: ['id_aseguradora', 'id_vehiculo'],
      select: {
        id_vehseg: true,
        n_poliza: true,
        estado_vencimiento: true,
        fecha_vigencia_desde: true,
        fecha_vigencia_hasta: true,
        id_aseguradora: {
          id: true,
          aseguradora: true,
        },
        id_vehiculo: {
          id: true,
          placa: true,
          imagen_url: true,
        },
        id_usuario_modificacion: true,
        fecha_modificacion: true,
      },
    });

    return seguroDetall;
  }

  async findAll(): Promise<VehiculoSeguro[]> {
    const vehiSeg = await this.vehiculoSeguroRepositorio.find({
      relations: ['id_aseguradora', 'id_vehiculo'],
      select: {
        id_vehseg: true,
        n_poliza: true,
        estado_vencimiento: true,
        fecha_vigencia_desde: true,
        fecha_vigencia_hasta: true,
        estado: true,
        detalle_baja: true,
        id_aseguradora: {
          id: true,
          aseguradora: true,
        },
        id_vehiculo: {
          id: true,
          placa: true,
          imagen_url: true,
        },
      },
    });
    return vehiSeg;
  }

  async findOne(id: number): Promise<VehiculoSeguro> {
    const vehiSeg = await this.vehiculoSeguroRepositorio.findOne({
      where: { id_vehseg: id },
      relations: ['id_aseguradora', 'id_vehiculo'],
      select: {
        id_vehseg: true,
        n_poliza: true,
        estado_vencimiento: true,
        fecha_vigencia_desde: true,
        fecha_vigencia_hasta: true,
        estado: true,
        detalle_baja: true,
        id_aseguradora: {
          id: true,
          aseguradora: true,
        },
        id_vehiculo: {
          id: true,
          placa: true,
          imagen_url: true,
        },
      },
    });
    return vehiSeg;
  }

  async estado(
    id_vehseg: number,
    cambioEstado: CambioEstadoSeguroVehiculoDto,
    id_usuario_modi: number,
  ): Promise<VehiculoSeguro> {
    const seguVehi = await this.vehiculoSeguroRepositorio.findOne({
      where: { id_vehseg },
    });
    if (!seguVehi)
      throw new NotFoundException(
        `Id${id_vehseg} de seguro del vehiculono encontrado`,
      );

    seguVehi.estado = cambioEstado.estado;
    if (cambioEstado.estado === 0) {
      if (!cambioEstado.detalle_baja) {
        throw new BadRequestException(
          'Se requiere un detalle si se cambia el seguro a baja',
        );
      }
      seguVehi.detalle_baja = cambioEstado.detalle_baja;
    } else {
      seguVehi.detalle_baja = null;
    }
    seguVehi.id_usuario_modificacion = id_usuario_modi;

    return await this.vehiculoSeguroRepositorio.save(seguVehi);
  }
}
