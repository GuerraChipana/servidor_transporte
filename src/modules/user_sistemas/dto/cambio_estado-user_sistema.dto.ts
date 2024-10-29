import { ApiProperty } from '@nestjs/swagger';
import {
  IsIn,
  IsNotEmpty,
  IsString,
  Length,
  Min,
  ValidateIf,
} from 'class-validator';

export class CambioEstadoUserDto {
  @ApiProperty({
    minimum: 0,
    maximum: 1,
    description: 'Estado del usuario (activo = 1, inactivo = 0)',
  })
  @IsNotEmpty()
  @IsIn([0, 1])
  estado: number;

  @ApiProperty({
    description: 'Detalle del motivo por el cual se dio de baja',
    minLength: 15,
    maxLength: 400,
    required: false,
  })
  @ValidateIf((o) => o.estado === 0) // Solo valida si el estado es 0
  @IsNotEmpty()
  @IsString()
  @Length(15, 400)
  detalle_baja?: string;
}
