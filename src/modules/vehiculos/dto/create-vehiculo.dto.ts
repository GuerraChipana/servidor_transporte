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
  @IsOptional()
  @IsString()
  imagen_url?: string;

  @IsString()
  @Length(6, 8)
  @IsNotEmpty({ message: 'No puede estar vacío la placa' })
  @Matches(/^[A-Za-z0-9-]+$/, {
    message:
      'El número de placa solo puede contener letras, números y guiones.',
  })
  placa: string;

  @IsString()
  @Length(6, 12)
  @IsNotEmpty()
  n_tarjeta: string;

  @IsString()
  @Length(11, 17)
  @IsNotEmpty({ message: 'El número de motor no puede estar vacío' })
  n_motor: string;

  @IsString()
  @Length(3, 10)
  @IsNotEmpty()
  marca: string;

  @IsString()
  @IsNotEmpty()
  color: string;

  @IsInt()
  @Min(1990, { message: 'El año de compra no puede ser menor a 1990' })
  @Max(new Date().getFullYear())
  @Transform(({ value }) => parseInt(value, 10), { toClassOnly: true }) // Convierte el valor a número
  ano_de_compra: number;

  @IsNotEmpty({ message: 'No puede estar vacío el propietario' })
  propietario1: number;

  @IsOptional()
  propietario2?: number | null;
}
