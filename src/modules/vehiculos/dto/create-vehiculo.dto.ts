import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsString,
  IsInt,
  IsOptional,
  IsNotEmpty,
  Length,
  Min,
  Max,
  Matches,
} from 'class-validator';

export class CreateVehiculoDto {
  @ApiProperty({
    description: 'Imagen del vehículo (opcional)',
    example: 'vehiculo.jpg',
    required: false,
  })
  @IsOptional()
  @IsString()
  imagen_url?: string;

  @ApiProperty({
    description: 'Número de placa del vehículo',
    example: 'NG-23173',
  })
  @IsString()
  @Length(6, 8)
  @IsNotEmpty({ message: 'No puede estar vacío la placa' })
  @Matches(/^[A-Za-z0-9-]+$/, {
    message:
      'El número de placa solo puede contener letras, números y guiones.',
  })
  placa: string;

  @ApiProperty({
    description: 'Número de tarjeta del vehículo',
    example: '880817',
  })
  @IsString()
  @Length(6, 12)
  @IsNotEmpty()
  n_tarjeta: string;

  @ApiProperty({
    description: 'Número de motor del vehículo',
    example: '1ZVHT85H595M12345',
    maxLength: 17,
    minLength: 11,
  })
  @IsString()
  @Length(11, 17)
  @IsNotEmpty({ message: 'El número de motor no puede estar vacío' })
  n_motor: string;

  @ApiProperty({ description: 'Marca del vehículo', example: 'Toyota' })
  @IsString()
  @Length(3, 10)
  @IsNotEmpty()
  marca: string;

  @ApiProperty({ description: 'Color del vehículo', example: 'Rojo' })
  @IsString()
  @IsNotEmpty()
  color: string;

  @ApiProperty({ description: 'Año de compra del vehículo', example: 2020 })
  @IsInt()
  @Min(1990, { message: 'El año de compra no puede ser menor a 1990' })
  @Max(new Date().getFullYear())
  @Transform(({ value }) => parseInt(value, 10), { toClassOnly: true }) // Convierte el valor a número
  ano_de_compra: number;

  @ApiProperty({
    description: 'ID del primer propietario del vehículo',
    example: 1,
  })
  @IsNotEmpty({ message: 'No puede estar vacío el propietario' })
  propietario1: number;

  @ApiProperty({
    description: 'ID del segundo propietario del vehículo (opcional)',
    example: 2,
    required: false,
  })
  @IsOptional()
  propietario2?: number;
}