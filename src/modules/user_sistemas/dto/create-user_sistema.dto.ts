import { IsString, IsEnum, IsNotEmpty, Length, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Rol } from '../entities/user_sistema.entity';

export class CreateUserSistemaDto {
  @ApiProperty({ description: 'Nombres completos del usuario', minLength: 2, maxLength: 100 })
  @IsString()
  @IsNotEmpty()
  @Length(2, 100)
  nombre: string;

  @ApiProperty({ description: 'Apellido paterno del usuario', minLength: 3, maxLength: 100 })
  @IsString()
  @IsNotEmpty()
  @Length(3, 100)
  apPaterno: string;

  @ApiProperty({ description: 'Apellido materno del usuario', minLength: 3, maxLength: 100 })
  @IsString()
  @IsNotEmpty()
  @Length(3, 100)
  apMaterno: string;

  @ApiProperty({ description: 'DNI del usuario, debe contener exactamente 6 dígitos numéricos', pattern: '^[0-9]{6}$' })
  @IsString()
  @IsNotEmpty()
  @Length(6, 6)
  @Matches(/^\d{6}$/, {
    message: 'DNI debe contener exactamente 6 dígitos numéricos',
  })
  dni: string;

  @ApiProperty({ description: 'Nombre alias del usuario', minLength: 2, maxLength: 50 })
  @IsString()
  @IsNotEmpty()
  @Length(2, 50)
  username: string;

  @ApiProperty({ description: 'Contraseña del usuario', minLength: 8, maxLength: 255 })
  @IsString()
  @IsNotEmpty()
  @Length(8, 255)
  password: string;

  @ApiProperty({ description: 'Rol del usuario', enum: Rol })
  @IsEnum(Rol)
  rol: Rol;
}
