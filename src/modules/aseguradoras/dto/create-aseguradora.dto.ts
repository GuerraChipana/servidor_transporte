import { IsNotEmpty, Length } from 'class-validator';

export class CreateAseguradoraDto {
  @IsNotEmpty({ message: 'El nombre de la aseguradora no puede estar vacio' })
  @Length(4, 50, {
    message: 'La aseguradora debe contar con 4 caracteres como minimo',
  })
  aseguradora: string;
}
