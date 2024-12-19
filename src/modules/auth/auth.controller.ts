import {
  Controller,
  Post,
  Body,
  HttpCode,
  UnauthorizedException,
  Get,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { UserRequestRequest } from '../user-request.Request';
import { JwtAuthGuard } from './jwt.auth.guard';

@Controller('api/Login')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(201)
  @Post()
  async login(@Body() loginDto: LoginDto) {
    try {
      return await this.authService.login(loginDto);
    } catch (error) {
      throw new UnauthorizedException('Credenciales Invalidas');
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async bienvenida(@Request() req: UserRequestRequest) {
    const userid = req.user.id;
    return await this.authService.bievenida(userid);
  }

  @UseGuards(JwtAuthGuard)
  @Get('cuenta')
  async cuenta(@Request() req: UserRequestRequest) {
    const userid = req.user.id;
    return await this.authService.cuenta(userid);
  }
}
