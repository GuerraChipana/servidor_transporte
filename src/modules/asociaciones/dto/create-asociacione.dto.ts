import { IsNotEmpty, Length } from 'class-validator';

export class CreateAsociacioneDto {
  @IsNotEmpty({ message: 'El nombre no puede estar vacío' })
  @Length(5, 100, {
    message: 'El nombre debe contar mínimo con 5 caracteres',
  })
  nombre: string;

  @IsNotEmpty({ message: 'El documento no puede estar vacío' })
  @Length(5, 200, {
    message: 'El documento debe contar mínimo con 5 caracteres',
  })
  documento: string;
}
