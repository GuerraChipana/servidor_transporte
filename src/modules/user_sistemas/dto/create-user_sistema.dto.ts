import {
  IsString,
  IsEnum,
  IsNotEmpty,
  Length,
  Matches,
  IsEmail,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Rol } from '../entities/user_sistema.entity';

export class CreateUserSistemaDto {
  @ApiProperty({
    description: 'Nombres completos del usuario',
    minLength: 2,
    maxLength: 100,
  })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre no puede estar vacío' })
  @Length(2, 100, { message: 'El nombre debe tener entre 2 y 100 caracteres' })
  nombre: string;

  @ApiProperty({
    description: 'Apellido paterno del usuario',
    minLength: 3,
    maxLength: 100,
  })
  @IsString({ message: 'El apellido paterno debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El apellido paterno no puede estar vacío' })
  @Length(3, 100, {
    message: 'El apellido paterno debe tener entre 3 y 100 caracteres',
  })
  apPaterno: string;

  @ApiProperty({
    description: 'Apellido materno del usuario',
    minLength: 3,
    maxLength: 100,
  })
  @IsString({ message: 'El apellido materno debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El apellido materno no puede estar vacío' })
  @Length(3, 100, {
    message: 'El apellido materno debe tener entre 3 y 100 caracteres',
  })
  apMaterno: string;

  @ApiProperty({
    description:
      'DNI del usuario, debe contener exactamente 6 dígitos numéricos',
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
    description: 'Correo electrónico del usuario',
    minLength: 8,
    maxLength: 100,
  })
  @IsEmail({}, { message: 'El correo electrónico debe ser válido' })
  @IsNotEmpty({ message: 'El correo electrónico no puede estar vacío' })
  @Length(8, 100, {
    message: 'El correo electrónico debe tener entre 8 y 100 caracteres',
  })
  email: string;

  @ApiProperty({
    description: 'Nombre alias del usuario',
    minLength: 2,
    maxLength: 50,
  })
  @IsString({ message: 'El nombre de usuario debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre de usuario no puede estar vacío' })
  @Length(5, 50, {
    message: 'El nombre de usuario debe tener entre 5 y 50 caracteres',
  })
  username: string;

  @ApiProperty({
    description: 'Contraseña del usuario',
    minLength: 8,
    maxLength: 255,
  })
  @IsString({ message: 'La contraseña debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La contraseña no puede estar vacía' })
  @Length(8, 255, {
    message: 'La contraseña debe tener entre 8 y 255 caracteres',
  })
  password: string;

  @ApiProperty({ description: 'Rol del usuario', enum: Rol })
  @IsEnum(Rol, { message: 'Rol no válido' })
  rol: Rol;
}
