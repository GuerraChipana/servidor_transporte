import { PartialType } from '@nestjs/swagger';
import { CreateAseguradoraDto } from './create-aseguradora.dto';

export class UpdateAseguradoraDto extends PartialType(CreateAseguradoraDto) {}
