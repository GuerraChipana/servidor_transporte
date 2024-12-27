import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get('api') // Responde a la ruta /api
  getApi(): string {
    return '¡Conexión exitosa!';
  }
}
