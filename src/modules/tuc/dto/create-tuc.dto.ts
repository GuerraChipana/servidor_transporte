import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsDate, Max, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateTucDto {
  @ApiProperty({ description: 'Numero de Tuc' })
  @IsNotEmpty({ message: 'Numero de tuc no puede estar vacio' })
  @IsInt()
  n_tuc: number;

  @ApiProperty({ description: 'Año del TUC' })
  @IsNotEmpty({ message: 'El año no puede estar vacío' })
  @IsInt({ message: 'El año debe ser un número entero' })
  @Min(2000, { message: 'El año debe ser mayor o igual a 2000' })
  @Max(2155, { message: 'El año debe ser menor o igual a 2155' })
  ano_tuc: number;

  @ApiProperty({ description: 'Id de la asociacion asignada' })
  @IsInt()
  id_asociacion: number;

  @ApiProperty({ description: 'Id del vehiculo asignado' })
  @IsNotEmpty({ message: 'El número id del vehiculo no puede estar vacío' })
  @IsInt()
  id_vehiculo: number;

  @ApiProperty({
    description: 'Fecha de inicio de la tarjeta TUC',
    type: String,
    format: 'date',
    example: '2024-11-01',
  })
  @IsDate()
  @Transform(({ value }) => {
    // Convierte la fecha string en un objeto Date
    return new Date(value);
  })
  fecha_desde: Date;
}
