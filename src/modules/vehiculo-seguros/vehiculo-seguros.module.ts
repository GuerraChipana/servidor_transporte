import { Module } from '@nestjs/common';
import { VehiculoSegurosService } from './vehiculo-seguros.service';
import { VehiculoSegurosController } from './vehiculo-seguros.controller';
import { Aseguradora } from '../aseguradoras/entities/aseguradora.entity';
import { Vehiculo } from '../vehiculos/entities/vehiculo.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VehiculoSeguro } from './entities/vehiculo-seguro.entity';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([Vehiculo, Aseguradora, VehiculoSeguro]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1h' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [VehiculoSegurosController],
  providers: [VehiculoSegurosService],
})
export class VehiculoSegurosModule {}
