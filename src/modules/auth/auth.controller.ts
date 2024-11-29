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
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserRequestRequest } from '../user-request.Request';
import { JwtAuthGuard } from './jwt.auth.guard';

@ApiTags('Login')
@Controller('Login')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(201)
  @Post()
  @ApiOperation({ summary: 'Login para entrar al sistema de transporte' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 201, description: 'Ingresado con exito.' })
  @ApiResponse({ status: 500, description: 'Error interno de servidor.' })
  async login(@Body() loginDto: LoginDto) {
    try {
      return await this.authService.login(loginDto);
    } catch (error) {
      throw new UnauthorizedException('Credenciales Invalidas');
    }
  }

  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Da la bienvenida (token)' })
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
