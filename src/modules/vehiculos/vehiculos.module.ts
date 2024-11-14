import { Module } from '@nestjs/common';
import { VehiculosService } from './vehiculos.service';
import { VehiculosController } from './vehiculos.controller';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImagenesModule } from '../imagenes/imagenes.module';
import { Persona } from '../personas/entities/persona.entity';
import { UserSistema } from '../user_sistemas/entities/user_sistema.entity';
import { Vehiculo } from './entities/vehiculo.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Vehiculo, Persona, UserSistema]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1h' },
      }),
      inject: [ConfigService],
    }),
    HttpModule,
    ImagenesModule,
  ],
  controllers: [VehiculosController],
  providers: [VehiculosService],
})
export class VehiculosModule {}
