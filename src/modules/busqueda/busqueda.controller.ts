import { Controller, Get, Param } from '@nestjs/common';
import { BusquedaService } from './busqueda.service';
import { ParseIntPipe } from '@nestjs/common';

@Controller('api/busqueda')
export class BusquedaController {
  constructor(private readonly busquedaService: BusquedaService) {}

  // Ruta para buscar por número de empadronamiento
  @Get('empadronamiento/:n_empadro')
  async busquedaPorEmpadronamiento(
    @Param('n_empadro', ParseIntPipe) n_empadro: number,
  ) {
    try {
      const resultado =
        await this.busquedaService.buscarEmpadronamiento(n_empadro);
      if (!resultado) {
        return `Empadronamiento con el número ${n_empadro} no encontrado`;
      }

      return resultado;
    } catch (error) {
      return `Empadronamiento con el número ${n_empadro} no encontrado`;
    }
  }

  // Ruta para buscar por placa
  @Get('placa/:placa')
  async busquedaPorPlaca(@Param('placa') placa: string) {
    try {
      const resultado = await this.busquedaService.buscarPorPlaca(placa);
      if (!resultado) {
        return `Vehículo con la placa ${placa} no encontrado`;
      }
      return resultado;
    } catch (error) {
      return `Vehículo con la placa ${placa} no encontrado`;
    }
  }
}
