import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEmail,
  IsPhoneNumber,
  Matches,
  Length,
  IsAlphanumeric,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePersonaDto {
  @ApiProperty({
    description:
      'DNI del usuario, debe contener exactamente 8 dígitos numéricos',
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
    example: '+51987654321',
  })
  @IsOptional()
  @IsPhoneNumber('PE', {
    message: 'El teléfono debe ser un número válido de Perú',
  })
  telefono?: string;

  @ApiProperty({
    description: 'Correo electrónico del usuario (opcional)',
    minLength: 8,
    maxLength: 100,
    example: 'usuario@example.com',
  })
  @IsOptional()
  @IsEmail({}, { message: 'El correo electrónico debe ser válido' })
  @IsNotEmpty({ message: 'El correo electrónico no puede estar vacío' })
  @Length(8, 100, {
    message: 'El correo electrónico debe tener entre 8 y 100 caracteres',
  })
  email?: string;

  @ApiProperty({
    description: 'Contraseña del usuario de consulta',
  })
  @IsString()
  @IsNotEmpty({ message: 'La contraseña no puede estar vacía' })
  password_consulta: string;
}
