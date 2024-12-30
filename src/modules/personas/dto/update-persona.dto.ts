import { IsOptional, IsEmail, Length, Matches } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdatePersonaDto {
  @IsOptional()
  @Matches(/^(?:\+51)?9\d{8}$/, {
    message: 'El teléfono debe ser un número de Perú y comenzar con 9',
  })
  telefono?: string;

  @IsOptional()
  @Transform(({ value }) => (value === '' ? null : value)) // Transforma "" en null
  @IsEmail({}, { message: 'El correo electrónico debe ser válido' })
  @Length(8, 100, {
    message: 'El correo electrónico debe tener entre 8 y 100 caracteres',
  })
  email?: string | null;

  @IsOptional()
  @Length(0, 250, {
    message: 'El domicilio no puede exceder los 250 caracteres',
  })
  domicilio?: string;
}
