import {
  Controller,
  Get,
  Param,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { BusquedaService } from './busqueda.service';
import { ParseIntPipe } from '@nestjs/common'; // Importa el Pipe para parsear el número

@Controller('api/busqueda')
export class BusquedaController {
  constructor(private readonly busquedaService: BusquedaService) {}

  // Ruta para buscar por número de empadronamiento
  @Get('empadronamiento/:n_empadro')
  async busquedaPorEmpadronamiento(
    @Param('n_empadro', ParseIntPipe) n_empadro: number, // Usar el ParseIntPipe para asegurarse de que n_empadro es un número
  ) {
    try {
      // Llamamos al servicio para obtener la información
      const resultado =
        await this.busquedaService.buscarEmpadronamiento(n_empadro);

      // Si no se encuentra el empadronamiento, lanzamos una excepción NotFound
      if (!resultado) {
        throw new NotFoundException(
          `Empadronamiento con el número ${n_empadro} no encontrado`,
        );
      }

      return resultado; // Devolvemos directamente el resultado que ya viene estructurado
    } catch (error) {
      // Si el error es específico de no encontrar el empadronamiento, retornamos una excepción NotFound
      if (error.message.includes('no encontrado')) {
        throw new NotFoundException(error.message);
      }

      // Si es otro tipo de error, lanzamos un InternalServerErrorException
      throw new InternalServerErrorException(
        `Error en el servidor: ${error.message}`,
      );
    }
  }

  // Ruta para buscar por placa
  @Get('placa/:placa')
  async busquedaPorPlaca(@Param('placa') placa: string) {
    try {
      // Llamamos al servicio para obtener la información por placa
      const resultado = await this.busquedaService.buscarPorPlaca(placa);

      // Si no se encuentra el vehículo, lanzamos una excepción NotFound
      if (!resultado) {
        throw new NotFoundException(
          `Vehículo con la placa ${placa} no encontrado`,
        );
      }

      return resultado; // Devolvemos directamente el resultado que ya viene estructurado
    } catch (error) {
      // Si el error es específico de no encontrar el vehículo, retornamos una excepción NotFound
      if (error.message.includes('no encontrado')) {
        throw new NotFoundException(error.message);
      }

      // Si es otro tipo de error, lanzamos un InternalServerErrorException
      throw new InternalServerErrorException(
        `Error en el servidor: ${error.message}`,
      );
    }
  }

}
