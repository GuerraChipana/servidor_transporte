import { IsString, IsNotEmpty, Length, IsOptional, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CambiarCredencialesDto {
  @ApiProperty({
    description: 'Nuevo nombre de usuario',
    minLength: 5,
    maxLength: 50,
    required: false,
  })
  @IsString({ message: 'El nombre de usuario debe ser una cadena de texto' })
  @IsOptional()
  @Length(5, 50, { message: 'El nombre de usuario debe tener entre 5 y 50 caracteres' })
  username?: string;

  @ApiProperty({
    description: 'Correo electrónico',
    minLength: 8,
    maxLength: 100,
    required: false,
  })
  @IsEmail({}, { message: 'El correo electrónico debe ser válido' })
  @IsOptional()
  @Length(8, 100, { message: 'El correo electrónico debe tener entre 8 y 100 caracteres' })
  email?: string;

  @ApiProperty({
    description: 'Contraseña actual',
    minLength: 8,
    maxLength: 255,
  })
  @IsString({ message: 'La contraseña actual debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La contraseña actual no puede estar vacía' })
  @IsOptional()
  @Length(8, 255, { message: 'La contraseña actual debe tener entre 8 y 255 caracteres' })
  password_actual?: string;

  @ApiProperty({
    description: 'Nueva contraseña',
    minLength: 8,
    maxLength: 255,
    required: false,
  })
  @IsString({ message: 'La nueva contraseña debe ser una cadena de texto' })
  @IsOptional()
  @Length(8, 255, { message: 'La nueva contraseña debe tener entre 8 y 255 caracteres' })
  password_nueva?: string;

  @ApiProperty({
    description: 'Confirmación de nueva contraseña',
    minLength: 8,
    maxLength: 255,
    required: false,
  })
  @IsString({ message: 'La confirmación de la nueva contraseña debe ser una cadena de texto' })
  @IsOptional()
  @Length(8, 255, { message: 'La confirmación de la nueva contraseña debe tener entre 8 y 255 caracteres' })
  confirmacion_password?: string;
}
