import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Empadronamiento } from '../empadronamiento/entities/empadronamiento.entity';
import { Vehiculo } from '../vehiculos/entities/vehiculo.entity';
import { VehiculoSeguro } from '../vehiculo-seguros/entities/vehiculo-seguro.entity';
import { Tuc } from '../tuc/entities/tuc.entity';
import { Asociacione } from '../asociaciones/entities/asociacione.entity';

@Injectable()
export class BusquedaService {
  constructor(
    @InjectRepository(Empadronamiento)
    private readonly empadronamientoRepo: Repository<Empadronamiento>,

    @InjectRepository(Vehiculo)
    private readonly vehiculoRepo: Repository<Vehiculo>,

    @InjectRepository(VehiculoSeguro)
    private readonly vehiculoSeguroRepo: Repository<VehiculoSeguro>,

    @InjectRepository(Tuc)
    private readonly tucRepo: Repository<Tuc>,

    @InjectRepository(Asociacione)
    private readonly asociacioneRepo: Repository<Asociacione>,
  ) {}

  // Método de búsqueda por empadronamiento
  async buscarEmpadronamiento(n_empadro: number) {
    const query = this.empadronamientoRepo
      .createQueryBuilder('empadronamiento')
      .leftJoinAndSelect('empadronamiento.id_vehiculo', 'vehiculo') // JOIN VEHICULO
      .leftJoinAndSelect('vehiculo.vehiculosSeguros', 'vehiculoSeguro') // JOIN VEHICULOSEGURO
      .leftJoinAndSelect('vehiculo.Tucs', 'tuc') // JOIN TUC
      .leftJoinAndSelect('tuc.id_asociacion', 'asociacion') // JOIN ASSOCIACION
      .where('empadronamiento.n_empadronamiento = :n_empadronamiento', {
        n_empadronamiento: n_empadro,
      })
      .andWhere('empadronamiento.estado = :estado', { estado: 1 }) // Empadronamiento activo
      .select([
        'empadronamiento.n_empadronamiento',
        'vehiculo.id', // Agregar el id del vehiculo
        'vehiculo.imagen_url',
        'vehiculo.placa',
        'vehiculo.n_tarjeta',
        'vehiculo.marca',
        'vehiculo.color',
        'vehiculo.estado',
        'vehiculoSeguro.n_poliza',
        'vehiculoSeguro.estado_vencimiento',
        'vehiculoSeguro.fecha_vigencia_hasta',
        'tuc.n_tuc', // Número de TUC
        'tuc.estado', // Estado del TUC (estado = 1 o estado = 0)
        'tuc.estado_vigencia', // Estado de vigencia del TUC
        'tuc.id_asociacion',
        'asociacion.nombre', // Nombre de la Asociación
      ])
      .getOne(); // Queremos solo un resultado

    if (!query) {
      throw new Error(
        `Empadronamiento con el número ${n_empadro} no encontrado`,
      );
    }

    const empadronamiento = await query;

    if (!empadronamiento.id_vehiculo) {
      throw new Error(
        `Vehículo relacionado no encontrado para el empadronamiento ${n_empadro}`,
      );
    }

    const vehiculosSeguros =
      empadronamiento.id_vehiculo.vehiculosSeguros?.map((seguro) => ({
        n_poliza: seguro.n_poliza,
        estado_vencimiento: seguro.estado_vencimiento,
        fecha_vigencia_hasta: seguro.fecha_vigencia_hasta,
      })) || [];

    const tucs = empadronamiento.id_vehiculo.Tucs || [];

    const tucsActivos = tucs.filter((tuc) => tuc.estado === 1);

    const numeroTuc =
      tucsActivos.length > 0 ? tucsActivos[0].n_tuc : 'No TUC Asociado';
    const estadoVigenciaTuc =
      tucsActivos.length > 0 ? tucsActivos[0].estado_vigencia : 'No Vigente';
    const asociacion =
      tucsActivos.length > 0
        ? tucsActivos[0].id_asociacion?.nombre
        : 'No Asociado';

    return {
      n_empadronamiento: empadronamiento.n_empadronamiento,
      vehiculo: {
        id_vehiculo: empadronamiento.id_vehiculo.id,
        imagen_url: empadronamiento.id_vehiculo.imagen_url,
        placa: empadronamiento.id_vehiculo.placa,
        n_tarjeta: empadronamiento.id_vehiculo.n_tarjeta,
        marca: empadronamiento.id_vehiculo.marca,
      },
      vehiculosSeguros:
        vehiculosSeguros.length > 0
          ? vehiculosSeguros
          : 'No hay vehículos seguros disponibles',
      asociacion: asociacion,
      numeroTuc: numeroTuc,
      estadoVigenciaTuc: estadoVigenciaTuc,
    };
  }
  
  // Método de búsqueda por placa
  async buscarPorPlaca(placa: string) {
    // Buscar el vehículo por su placa
    const vehiculo = await this.vehiculoRepo
      .createQueryBuilder('vehiculo')
      .leftJoinAndSelect('vehiculo.vehiculosSeguros', 'vehiculoSeguro') // JOIN VEHICULOSEGURO
      .leftJoinAndSelect('vehiculo.Tucs', 'tuc') // JOIN TUC
      .leftJoinAndSelect('tuc.id_asociacion', 'asociacion') // JOIN ASOCIACION
      .leftJoinAndSelect('vehiculo.EmpadronamientoVehiculo', 'empadronamiento') // JOIN EMPADRONAMIENTO
      .where('vehiculo.placa = :placa', { placa })
      .andWhere('vehiculo.estado = :estado', { estado: 1 }) // Vehículo activo
      .select([
        'vehiculo.id', // ID del vehículo
        'vehiculo.imagen_url',
        'vehiculo.placa',
        'vehiculo.n_tarjeta',
        'vehiculo.marca',
        'vehiculo.color',
        'vehiculo.estado',
        'empadronamiento.n_empadronamiento', // Número de empadronamiento
        'vehiculoSeguro.n_poliza',
        'vehiculoSeguro.estado_vencimiento',
        'vehiculoSeguro.fecha_vigencia_hasta',
        'tuc.n_tuc',
        'tuc.estado',
        'tuc.estado_vigencia',
        'asociacion.nombre', // Nombre de la Asociación
      ])
      .getOne();

    if (!vehiculo) {
      throw new Error(`Vehículo con placa ${placa} no encontrado`);
    }

    // Si no hay empadronamiento para el vehículo
    if (
      !vehiculo.EmpadronamientoVehiculo ||
      vehiculo.EmpadronamientoVehiculo.length === 0
    ) {
      throw new Error(
        `Empadronamiento no encontrado para el vehículo con placa ${placa}`,
      );
    }

    // Obtener el seguro del vehículo
    const vehiculosSeguros =
      vehiculo.vehiculosSeguros?.map((seguro) => ({
        n_poliza: seguro.n_poliza,
        estado_vencimiento: seguro.estado_vencimiento,
        fecha_vigencia_hasta: seguro.fecha_vigencia_hasta,
      })) || [];

    // Obtener los TUC asociados
    const tucs = vehiculo.Tucs || [];

    // Filtrar los TUC activos
    const tucsActivos = tucs.filter((tuc) => tuc.estado === 1);

    const numeroTuc =
      tucsActivos.length > 0 ? tucsActivos[0].n_tuc : 'No TUC Asociado';
    const estadoVigenciaTuc =
      tucsActivos.length > 0 ? tucsActivos[0].estado_vigencia : 'No Vigente';
    const asociacion =
      tucsActivos.length > 0
        ? tucsActivos[0].id_asociacion?.nombre
        : 'No Asociado';

    // Respuesta con los datos del vehículo y sus relaciones
    return {
      vehiculo: {
        id_vehiculo: vehiculo.id,
        imagen_url: vehiculo.imagen_url,
        placa: vehiculo.placa,
        n_tarjeta: vehiculo.n_tarjeta,
        marca: vehiculo.marca,
      },
      empadronamiento: {
        n_empadronamiento:
          vehiculo.EmpadronamientoVehiculo[0].n_empadronamiento,
      },
      vehiculosSeguros:
        vehiculosSeguros.length > 0
          ? vehiculosSeguros
          : 'No hay vehículos seguros disponibles',
      asociacion: asociacion,
      numeroTuc: numeroTuc,
      estadoVigenciaTuc: estadoVigenciaTuc,
    };
  }
}
