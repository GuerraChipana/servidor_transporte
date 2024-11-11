import { PartialType } from '@nestjs/swagger';
import { CreateConductoreDto } from './create-conductore.dto';

export class UpdateConductoreDto extends PartialType(CreateConductoreDto) {}
