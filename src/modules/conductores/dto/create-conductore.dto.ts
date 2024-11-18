import {
  IsInt,
  IsString,
  IsOptional,
  MaxLength,
  IsNotEmpty,
  IsIn,
  Length,
  Matches,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export enum CategoriaLicencia {
  'B-I' = 'B-I',
  'B-IIa' = 'B-IIa',
  'B-IIb' = 'B-IIb',
  'B-IIc' = 'B-IIc',
}

export class CreateConductoreDto {
  @ApiProperty({
    description: 'ID de la persona asociada al conductor (clave foránea)',
    type: Number,
  })
  @IsInt({ message: 'El ID de la persona debe ser un número entero.' })
  @IsNotEmpty({ message: 'El ID de la persona no puede estar vacío.' })
  id_persona: number;

  @ApiProperty({
    description: 'Número de licencia del conductor',
    type: String,
    minLength: 7,
    maxLength: 7,
  })
  @IsString()
  @Length(7, 7, { message: 'La licencia debe tener exactamente 7 caracteres.' })
  @IsNotEmpty({ message: 'El número de licencia no puede estar vacío.' })
  @Matches(/^[A-Za-z0-9-]+$/, {
    message:
      'El número de licencia solo puede contener letras, números y guiones.',
  })
  n_licencia: string;

  @ApiProperty({
    description: 'Categoría de la licencia del conductor',
    type: String,
    example: 'B-I',
    enum: CategoriaLicencia,
  })
  @IsIn(Object.values(CategoriaLicencia), {
    message:
      'Categoría de licencia no válida. Debe ser uno de los siguientes: B-I, B-IIa, B-IIb, B-IIc.',
  })
  categoria: CategoriaLicencia;

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
  fecha_desde: string;

  @ApiProperty({
    description: 'Restricciones asociadas a la licencia (opcional)',
    type: String,
    maxLength: 50,
    required: false,
    example: 'Debe usar gafas para conducir.',
  })
  @IsOptional()
  @IsString({ message: 'La restricción debe ser un texto.' })
  @MaxLength(50, {
    message: 'La restricción no puede tener más de 50 caracteres.',
  })
  restriccion?: string;

  @ApiProperty({
    description: 'Grupo sanguíneo del conductor',
    type: String,
    maxLength: 10,
    example: 'O+',
  })
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

  @ApiProperty({
    description: 'Lista de identificadores de vehículos asociados al conductor',
    type: [Number],
    isArray: true,
    required: false,
    example: [11, 2, 4],
  })
  @IsOptional()
  @IsArray()
  @IsNotEmpty({ each: true, message: 'Cada ID de vehículo debe ser un número válido.' })
  vehiculos?: number[];
}
