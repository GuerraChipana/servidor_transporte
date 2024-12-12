import {
  IsOptional,
  IsEmail,
  IsNotEmpty,
  Length,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePersonaDto {
  @ApiProperty({
    description:
      'Teléfono de la persona (opcional), debe ser un número válido de Perú y comenzar con 9',
  })
  @IsOptional()
  @Matches(/^(?:\+51)?9\d{8}$/, {
    message: 'El teléfono debe ser un número de Perú y comenzar con 9',
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

  @ApiProperty({
    description: 'Domicilio de la persona (opcional)',
    maxLength: 250,
  })
  @IsOptional()
  @Length(0, 250, {
    message: 'El domicilio no puede exceder los 250 caracteres',
  })
  domicilio?: string;
}
