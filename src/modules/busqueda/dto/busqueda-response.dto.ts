// src/modules/busqueda/dto/busqueda-response.dto.ts
export class BusquedaResponseDto {
    n_empadronamiento: number;
    vehiculo: {
      imagen_url: string;
      placa: string;
      n_tarjeta: string;
      detalles: {
        conductor: {
          id_persona: { dni: string; apPaterno: string; nombre: string };
        };
      };
    };
    vehiculosSeguros: Array<{
      n_poliza: string;
      estado_vencimiento: string;
      fecha_vigencia_hasta: Date;
    }>;
    Tucs: Array<{
      estado_vigencia: string;
    }>;
  }
  