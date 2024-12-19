import {
  IsInt,
  IsString,
  Matches,
  IsNotEmpty,
  Validate,
} from 'class-validator';

export class CreateVehiculoSeguroDto {
  @IsInt({ message: 'El ID de la aseguradora debe ser un número entero' })
  @IsNotEmpty({ message: 'El ID de la aseguradora no puede estar vacío' })
  id_aseguradora: number;

  @IsInt({ message: 'El ID del vehículo debe ser un número entero' })
  id_vehiculo: number;

  @IsNotEmpty({ message: 'El número de póliza no puede estar vacío' })
  n_poliza: string;

  @IsString({ message: 'La fecha de inicio debe ser una cadena de texto.' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'La fecha debe estar en el formato válido: YYYY-MM-DD.',
  })
  @IsNotEmpty({ message: 'La fecha de vigencia desde no puede estar vacía' })
  fecha_vigencia_desde: Date;

  @IsString({ message: 'La fecha de inicio debe ser una cadena de texto.' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'La fecha debe estar en el formato válido: YYYY-MM-DD.',
  })
  @IsNotEmpty({ message: 'La fecha de vigencia hasta no puede estar vacía' })
  fecha_vigencia_hasta: Date;
}
