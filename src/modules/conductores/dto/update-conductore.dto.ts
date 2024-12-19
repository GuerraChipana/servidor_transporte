import {
  IsString,
  IsOptional,
  MaxLength,
  IsNotEmpty,
  IsIn,
  Length,
  Matches,
  IsArray,
} from 'class-validator';
import { CategoriaLicencia } from './create-conductore.dto';

export class UpdateConductoreDto {
  @IsString()
  @Length(7, 7, { message: 'La licencia debe tener exactamente 7 caracteres.' })
  @IsNotEmpty({ message: 'El número de licencia no puede estar vacío.' })
  @Matches(/^[A-Za-z0-9-]+$/, {
    message:
      'El número de licencia solo puede contener letras, números y guiones.',
  })
  n_licencia: string;

  @IsIn(Object.values(CategoriaLicencia), {
    message:
      'Categoría de licencia no válida. Debe ser uno de los siguientes: B-I, B-IIa, B-IIb, B-IIc.',
  })
  categoria: CategoriaLicencia;

  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'La fecha debe estar en el formato válido: YYYY-MM-DD.',
  })
  fecha_desde: Date;

  @IsOptional()
  @IsString({ message: 'La restricción debe ser un texto.' })
  @MaxLength(50, {
    message: 'La restricción no puede tener más de 50 caracteres.',
  })
  restriccion?: string;

  @IsString({
    message: 'El grupo sanguíneo debe ser una cadena de caracteres.',
  })
  @IsNotEmpty({ message: 'El campo de grupo sanguíneo no puede estar vacío.' })
  @MaxLength(10, {
    message: 'El grupo sanguíneo no puede tener más de 10 caracteres.',
  })
  @Matches(/^(A|B|AB|O)[+-]$/, {
    message:
      'El grupo sanguíneo debe ser un formato válido (Ejemplo: O+, A-, B+, AB-).',
  })
  g_sangre: string;

  @IsOptional()
  @IsArray()
  @IsNotEmpty({
    each: true,
    message: 'Cada ID de vehículo debe ser un número válido.',
  })
  vehiculos?: number[];
}
