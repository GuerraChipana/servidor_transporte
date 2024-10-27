import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiTags } from '@nestjs/swagger';


// Todo http://localhost:3005
@ApiTags('test_prueba')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('users')
  getUsers(): String[]{
    return ['Luis','Jesus']
  }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
