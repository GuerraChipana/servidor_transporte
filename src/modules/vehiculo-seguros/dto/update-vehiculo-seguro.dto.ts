import { PartialType } from '@nestjs/swagger';
import { CreateVehiculoSeguroDto } from './create-vehiculo-seguro.dto';

export class UpdateVehiculoSeguroDto extends PartialType(
  CreateVehiculoSeguroDto,
) {}
