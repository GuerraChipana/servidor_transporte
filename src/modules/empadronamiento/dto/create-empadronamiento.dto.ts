import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty } from 'class-validator';

export class CreateEmpadronamientoDto {
  @ApiProperty({ description: 'Numero de empadronamiento' })
  @IsNotEmpty({ message: 'No pude estar vacio el numero de empadronamiento' })
  @IsInt({ message: 'Debe de ser un numero entero' })
  n_empadronamiento: number;

  @ApiProperty({ description: 'Id del vehiculo asignado' })
  @IsNotEmpty({ message: 'No puede estar vacio el id_vehiculo' })
  @IsInt({ message: 'Debe de ser un numero entero el id_vehiculo' })
  id_vehiculo: number;
}
