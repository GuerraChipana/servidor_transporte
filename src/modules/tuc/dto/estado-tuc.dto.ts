import { ApiProperty } from '@nestjs/swagger';
import {
  IsIn,
  IsNotEmpty,
  IsString,
  Length,
  ValidateIf,
} from 'class-validator';

export class EstadoDtoTuc {
  @ApiProperty({
    minimum: 0,
    maximum: 1,
    description: 'Estado de TUC (activo = 1, inactivo = 0)',
  })
  @IsNotEmpty()
  @IsIn([0, 1])
  estado: number;

  @ApiProperty({
    description: 'Detalle del motivo por el cual el Tuc se dio a la baja',
    minLength: 15,
    maxLength: 400,
    required: false,
  })
  @ValidateIf((o) => o.estado === 0)
  @IsNotEmpty()
  @IsString()
  @Length(15, 400)
  detalle_baja?: string;
}
