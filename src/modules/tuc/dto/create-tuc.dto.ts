import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsInt, IsNotEmpty, IsNumber, Matches } from 'class-validator';

export class CreateTucDto {
  @ApiProperty({ description: 'Numero de TUC' })
  @IsNotEmpty({ message: 'Numero de tuc no puede estar vacio' })
  @IsInt({ message: 'El numero de tuc debe ser un número entero' })
  n_tuc: number;

  @ApiProperty({ description: 'Año del TUC' })
  @IsDate()
  @IsNotEmpty({ message: 'El año no puede estar vacio' })
  año: Date;

  @ApiProperty({ description: 'Id de la asociacion que se asignara' })
  @IsNotEmpty({
    message: 'El numero de id de la asociacion no puede estar vacio',
  })
  @IsInt({ message: 'El id de la asociacion debe ser un número entero' })
  id_asociacion: number;

  @ApiProperty({ description: 'Id del vehiculo que se asignara' })
  @IsNotEmpty({ message: 'El numero id del vehiculo no puede estar vacio' })
  @IsInt({ message: 'El id del vehiculo debe ser un número entero' })
  id_vehiculo: number;

  @ApiProperty({
    description: 'Fecha de inicio de la tarjeta TUC',
    type: String,
    format: 'date',
    example: '2024-11-01',
  })
  @IsDate()
  fecha_desde: Date;
}
