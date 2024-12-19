import { IsInt, IsNotEmpty, IsDate, Max, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateTucDto {
  @IsNotEmpty({ message: 'Numero de tuc no puede estar vacio' })
  @IsInt()
  n_tuc: number;

  @IsNotEmpty({ message: 'El año no puede estar vacío' })
  @IsInt({ message: 'El año debe ser un número entero' })
  @Min(2000, { message: 'El año debe ser mayor o igual a 2000' })
  @Max(2155, { message: 'El año debe ser menor o igual a 2155' })
  ano_tuc: number;

  @IsInt()
  id_asociacion: number;

  @IsNotEmpty({ message: 'El número id del vehiculo no puede estar vacío' })
  @IsInt()
  id_vehiculo: number;

  @IsDate()
  @Transform(({ value }) => {
    // Convierte la fecha string en un objeto Date
    return new Date(value);
  })
  fecha_desde: Date;
}
