import {
  IsIn,
  IsNotEmpty,
  IsString,
  Length,
  ValidateIf,
} from 'class-validator';
export class CambioEstadoAseguradoraDto {
  @IsIn([0, 1], { message: 'El estado puede ser 1 o 0 ' })
  estado: number;

  @ValidateIf((o) => o.estado === 0)
  @IsNotEmpty({ message: 'El detalle de baja no puede estar vacio' })
  @IsString()
  @Length(15, 400, { message: 'Detalle con un minimo de 15 caracteres ' })
  detalle_baja?: string;
}
