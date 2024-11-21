import { PartialType } from '@nestjs/swagger';
import { CreateTucDto } from './create-tuc.dto';

export class UpdateTucDto extends PartialType(CreateTucDto) {}
