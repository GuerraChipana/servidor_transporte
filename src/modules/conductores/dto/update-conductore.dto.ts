import { PartialType } from '@nestjs/mapped-types';
import { CreateConductoreDto } from './create-conductore.dto';

export class UpdateConductoreDto extends PartialType(CreateConductoreDto) {
  // Si se requiere algún campo adicional, lo puedes agregar aquí
  // Ejemplo: Si quieres que 'vehiculos' sea opcional en la actualización, no hace falta hacer nada.
}
