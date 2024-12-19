import {
  IsString,
  IsNotEmpty,
  Length,
  IsOptional,
  IsEmail,
} from 'class-validator';

export class CambiarCredencialesDto {
 
  @IsString({ message: 'El nombre de usuario debe ser una cadena de texto' })
  @IsOptional()
  @Length(5, 50, {
    message: 'El nombre de usuario debe tener entre 5 y 50 caracteres',
  })
  username?: string;

  @IsEmail({}, { message: 'El correo electrónico debe ser válido' })
  @IsOptional()
  @Length(8, 100, {
    message: 'El correo electrónico debe tener entre 8 y 100 caracteres',
  })
  email?: string;

 
  @IsString({ message: 'La contraseña actual debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La contraseña actual no puede estar vacía' })
  @IsOptional()
  @Length(8, 255, {
    message: 'La contraseña actual debe tener entre 8 y 255 caracteres',
  })
  password_actual?: string;

  
  @IsString({ message: 'La nueva contraseña debe ser una cadena de texto' })
  @IsOptional()
  @Length(8, 255, {
    message: 'La nueva contraseña debe tener entre 8 y 255 caracteres',
  })
  password_nueva?: string;

  
  @IsString({
    message:
      'La confirmación de la nueva contraseña debe ser una cadena de texto',
  })
  @IsOptional()
  @Length(8, 255, {
    message:
      'La confirmación de la nueva contraseña debe tener entre 8 y 255 caracteres',
  })
  confirmacion_password?: string;
}
