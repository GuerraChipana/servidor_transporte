import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEmail,
  Length,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePersonaDto {
  @ApiProperty({
    description: 'DNI del usuario, debe contener exactamente 8 dígitos numéricos',
    pattern: '^[0-9]{8}$',
  })
  @IsString({ message: 'El DNI debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El DNI no puede estar vacío' })
  @Length(8, 8, { message: 'El DNI debe contener exactamente 8 caracteres' })
  @Matches(/^\d{8}$/, {
    message: 'El DNI debe contener exactamente 8 dígitos numéricos',
  })
  dni: string;

  @ApiProperty({
    description:
      'Teléfono de la persona (opcional), debe contener de 9 a 11 dígitos',
  })
  @IsOptional()
  @Matches(/^(?:\+51)?9\d{8}$/, {
    message:
      'El teléfono debe ser un número de Perú y contener de 9 dígitos',
  })
  telefono?: string;

  @ApiProperty({
    description: 'Correo electrónico del usuario (opcional)',
    minLength: 8,
    maxLength: 100,
  })
  @IsOptional()
  @IsEmail({}, { message: 'El correo electrónico debe ser válido' })
  @IsNotEmpty({ message: 'El correo electrónico no puede estar vacío' })
  @Length(8, 100, {
    message: 'El correo electrónico debe tener entre 8 y 100 caracteres',
  })
  email?: string;
}
