import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEmail,
  IsPhoneNumber,
  Matches,
  Length,
} from 'class-validator';

export class CreatePersonaDto {
  @IsString({ message: 'El DNI debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El DNI no puede estar vacío' })
  @Length(8, 8, { message: 'El DNI debe contener exactamente 8 caracteres' })
  @Matches(/^\d{8}$/, {
    message: 'El DNI debe contener exactamente 8 dígitos numéricos',
  })
  dni: string;

  @IsOptional()
  @IsPhoneNumber('PE', {
    message: 'El teléfono debe ser un número válido de Perú',
  })
  telefono?: string;

  @IsOptional()
  @IsEmail({}, { message: 'El correo electrónico debe ser válido' })
  @Length(8, 100, {
    message: 'El correo electrónico debe tener entre 8 y 100 caracteres',
  })
  email?: string;

  @IsString()
  @IsNotEmpty({ message: 'El nombre no puede estar vacio' })
  nombre: string;

  @IsString()
  @IsNotEmpty({ message: 'Apellido Paterno no puede estar vacio' })
  apPaterno: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty({ message: 'Apellido Materno no puede estar vacio' })
  apMaterno?: string;

  @IsString()
  @IsNotEmpty({ message: 'Direccion no puede estar vacio' })
  direccion: string;

  @IsString()
  @IsNotEmpty({ message: 'Ubigeo no puede estar vacio' })
  ubigeo: string;

  @IsOptional()
  foto?: string;
}
