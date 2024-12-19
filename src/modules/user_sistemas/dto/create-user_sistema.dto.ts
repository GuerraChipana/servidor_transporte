import {
  IsString,
  IsEnum,
  IsNotEmpty,
  Length,
  Matches,
  IsEmail,
} from 'class-validator';
import { Rol } from '../entities/user_sistema.entity';

export class CreateUserSistemaDto {
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre no puede estar vacío' })
  @Length(2, 100, { message: 'El nombre debe tener entre 2 y 100 caracteres' })
  nombre: string;

  @IsString({ message: 'El apellido paterno debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El apellido paterno no puede estar vacío' })
  @Length(3, 100, {
    message: 'El apellido paterno debe tener entre 3 y 100 caracteres',
  })
  apPaterno: string;

  @IsString({ message: 'El apellido materno debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El apellido materno no puede estar vacío' })
  @Length(3, 100, {
    message: 'El apellido materno debe tener entre 3 y 100 caracteres',
  })
  apMaterno: string;

  @IsString({ message: 'El DNI debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El DNI no puede estar vacío' })
  @Length(8, 8, { message: 'El DNI debe contener exactamente 8 caracteres' })
  @Matches(/^\d{8}$/, {
    message: 'El DNI debe contener exactamente 8 dígitos numéricos',
  })
  dni: string;

  @IsEmail({}, { message: 'El correo electrónico debe ser válido' })
  @IsNotEmpty({ message: 'El correo electrónico no puede estar vacío' })
  @Length(8, 100, {
    message: 'El correo electrónico debe tener entre 8 y 100 caracteres',
  })
  email: string;

  @IsString({ message: 'El nombre de usuario debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre de usuario no puede estar vacío' })
  @Length(5, 50, {
    message: 'El nombre de usuario debe tener entre 5 y 50 caracteres',
  })
  username: string;

  @IsString({ message: 'La contraseña debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La contraseña no puede estar vacía' })
  @Length(8, 255, {
    message: 'La contraseña debe tener entre 8 y 255 caracteres',
  })
  password: string;

  @IsEnum(Rol, { message: 'Rol no válido' })
  rol: Rol;
}
