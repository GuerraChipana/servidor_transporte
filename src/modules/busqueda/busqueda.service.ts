import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Empadronamiento } from '../empadronamiento/entities/empadronamiento.entity';
import { Repository } from 'typeorm';
import { Vehiculo } from '../vehiculos/entities/vehiculo.entity';
import { BusquedaResponseDto } from './dto/busqueda-response.dto';  // Importamos el DTO

@Injectable()
export class BusquedaService {
  constructor(
    @InjectRepository(Empadronamiento)
    private readonly empadronamientoRepo: Repository<Empadronamiento>,

    @InjectRepository(Vehiculo)
    private readonly vehiculoRepo: Repository<Vehiculo>,
  ) {}

  async buscarEmpadronamiento(n_empadro: number): Promise<BusquedaResponseDto> {
    const empadro = await this.empadronamientoRepo.findOne({
      where: { n_empadronamiento: n_empadro },
      relations: [
        'id_vehiculo',
        'id_vehiculo.vehiculosSeguros',
        'id_vehiculo.Tucs',
        'id_vehiculo.detalles',
        'id_vehiculo.detalles.conductor',
      ],
      select: {
        n_empadronamiento: true,
        id_vehiculo: {
          imagen_url: true,
          placa: true,
          n_tarjeta: true,
          detalles: {
            conductor: {
              id_persona: { dni: true, apPaterno: true, nombre: true },
            },
          },
          vehiculosSeguros: {
            n_poliza: true,
            estado_vencimiento: true,
            fecha_vigencia_hasta: true,
          },
          Tucs: { estado_vigencia: true },
        },
      },
    });

    if (!empadro) {
      throw new Error(`Empadronamiento with number ${n_empadro} not found`);
    }

    // Transformamos la respuesta de acuerdo al DTO
    const busquedaResponse: BusquedaResponseDto = {
      n_empadronamiento: empadro.n_empadronamiento,
      vehiculo: {
        imagen_url: empadro.id_vehiculo.imagen_url,
        placa: empadro.id_vehiculo.placa,
        n_tarjeta: empadro.id_vehiculo.n_tarjeta,
        detalles: {
          conductor: {
            id_persona: empadro.id_vehiculo.detalles?.[0]?.conductor?.id_persona || { dni: '', apPaterno: '', nombre: '' },
          },
        },
      },
      vehiculosSeguros: empadro.id_vehiculo.vehiculosSeguros,
      Tucs: empadro.id_vehiculo.Tucs,
    };

    return busquedaResponse;
  }
}
