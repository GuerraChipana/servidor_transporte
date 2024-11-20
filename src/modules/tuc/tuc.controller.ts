import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  UseGuards,
  InternalServerErrorException,
} from '@nestjs/common';
import { TucService } from './tuc.service';
import { CreateTucDto } from './dto/create-tuc.dto';
import { UpdateTucDto } from './dto/update-tuc.dto';
import { UserRequestRequest } from '../user-request.Request';
import { JwtAuthGuard } from '../auth/jwt.auth.guard';
import { RolesGuard } from '../auth/roles.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('tuc')
export class TucController {
  constructor(private readonly tucService: TucService) {}

  @Post()
  create(
    @Body() createTucDto: CreateTucDto,
    @Request() req: UserRequestRequest,
  ) {
    const userId = req.user.id;
    try {
      return this.tucService.create(userId, createTucDto);
    } catch (error) {
      throw new InternalServerErrorException(`${error.message}`);
    }
  }
  @Get()
  async findAll() {
    return await this.tucService.findAll();
  }
}
