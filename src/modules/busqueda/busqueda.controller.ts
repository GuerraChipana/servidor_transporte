import {
  Controller,
  Get,
  Param,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { BusquedaService } from './busqueda.service';
import { BusquedaResponseDto } from './dto/busqueda-response.dto'; // Importa el DTO

@Controller('busqueda')
export class BusquedaController {
  constructor(private readonly busquedaService: BusquedaService) {}

  @Get(':n_empadro')
  async busqueda(@Param('n_empadro') n_empadro: string) {
    const nEmpadroNumber = parseInt(n_empadro, 10);

    if (isNaN(nEmpadroNumber)) {
      throw new BadRequestException('Invalid number for n_empadro');
    }

    try {
      return await this.busquedaService.buscarEmpadronamiento(nEmpadroNumber);
    } catch (error) {
      throw new InternalServerErrorException(`${error.message}`);
    }
  }
}
