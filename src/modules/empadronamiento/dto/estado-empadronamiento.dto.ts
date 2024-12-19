import {
  IsIn,
  IsNotEmpty,
  IsString,
  Length,
  ValidateIf,
} from 'class-validator';

export class EstadoEmpadronamientoDto {
  @IsNotEmpty()
  @IsIn([0, 1])
  estado: number;

  @ValidateIf((o) => o.estado === 0)
  @IsNotEmpty()
  @IsString()
  @Length(15, 400)
  detalle_baja?: string;
}
