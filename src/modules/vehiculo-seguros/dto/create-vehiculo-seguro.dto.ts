import {
  IsInt,
  IsString,
  Matches,
  IsNotEmpty,
  Validate,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateVehiculoSeguroDto {
  @ApiProperty({
    description: 'ID de la aseguradora del vehículo',
    example: 1,
  })
  @IsInt({ message: 'El ID de la aseguradora debe ser un número entero' })
  @IsNotEmpty({ message: 'El ID de la aseguradora no puede estar vacío' })
  id_aseguradora: number;

  @ApiProperty({
    description: 'ID del vehículo al que se le asigna el seguro',
    example: 123,
  })
  @IsInt({ message: 'El ID del vehículo debe ser un número entero' })
  id_vehiculo: number;

  @ApiProperty({
    description: 'Número de póliza del seguro',
    example: 'assdae-asefa',
  })
  @IsNotEmpty({ message: 'El número de póliza no puede estar vacío' })
  n_poliza: string;

  @ApiProperty({
    description: 'Fecha de inicio de la validez de la licencia del conductor',
    type: String,
    format: 'date',
    example: '2024-11-01',
  })
  @IsString({ message: 'La fecha de inicio debe ser una cadena de texto.' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'La fecha debe estar en el formato válido: YYYY-MM-DD.',
  })
  @IsNotEmpty({ message: 'La fecha de vigencia desde no puede estar vacía' })
  fecha_vigencia_desde: Date;

  @ApiProperty({
    description: 'Fecha de inicio de la validez de la licencia del conductor',
    type: String,
    format: 'date',
    example: '2024-11-01',
  })
  @IsString({ message: 'La fecha de inicio debe ser una cadena de texto.' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'La fecha debe estar en el formato válido: YYYY-MM-DD.',
  })
  @IsNotEmpty({ message: 'La fecha de vigencia hasta no puede estar vacía' })
  fecha_vigencia_hasta: Date;
}
