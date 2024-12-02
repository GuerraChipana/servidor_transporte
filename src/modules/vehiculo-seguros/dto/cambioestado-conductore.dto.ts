import { ApiProperty } from '@nestjs/swagger';
import {
  IsIn,
  IsNotEmpty,
  IsString,
  Length,
  ValidateIf,
} from 'class-validator';
export class CambioEstadoSeguroVehiculoDto {
  @ApiProperty({
    description: 'Estado de aseguradora (activo = 1, inactivo = 0)',
    minimum: 0,
    maximum: 1,
  })
  @IsIn([0, 1], { message: 'El estado puede ser 1 o 0 ' })
  estado: number;

  @ApiProperty({
    description: 'Motivo por el cual dio a la baja el seguro',
    minLength: 15,
    maxLength: 400,
    required: false,
  })
  @ValidateIf((o) => o.estado === 0)
  @IsNotEmpty({ message: 'El detalle de baja no puede estar vacio' })
  @IsString()
  @Length(15, 400, { message: 'Detalle con un minimo de 15 caracteres ' })
  detalle_baja?: string;
}
