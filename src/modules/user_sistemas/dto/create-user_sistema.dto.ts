import { IsString, IsEnum, IsNotEmpty, Length, Matches } from 'class-validator';
import { Rol } from '../entities/user_sistema.entity';

export class CreateUserSistemaDto {
  @IsString()
  @IsNotEmpty()
  @Length(2, 100)
  nombre: string;

  @IsString()
  @IsNotEmpty()
  @Length(3, 100)
  apPaterno: string;

  @IsString()
  @IsNotEmpty()
  @Length(6, 6)
  // Valida q sean digitos
  @Matches(/^\d{6}$/, {
    message: 'DNI debe contener exactamente 6 dígitos numéricos',
  })
  dni: string;

  @IsString()
  @IsNotEmpty()
  @Length(2, 50)
  usuario: string;

  @IsString()
  @IsNotEmpty()
  @Length(8, 255)
  contrasena: string;
  
  // Para definir el rol
  @IsEnum(Rol)
  rol: Rol;
}
