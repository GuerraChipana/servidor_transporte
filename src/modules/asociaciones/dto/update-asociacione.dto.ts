import { IsOptional, Length } from 'class-validator';

export class UpdateAsociacioneDto {
  @IsOptional()
  @Length(5, 100, {
    message: 'El nombre debe contar mínimo con 5 caracteres',
  })
  nombre?: string;

  @IsOptional()
  @Length(10, 200, {
    message: 'El documento debe contar mínimo con 10 caracteres',
  })
  documento?: string;
}
