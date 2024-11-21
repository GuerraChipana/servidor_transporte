import { Module } from '@nestjs/common';
import { TucService } from './tuc.service';
import { TucController } from './tuc.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tuc } from './entities/tuc.entity';
import { Vehiculo } from '../vehiculos/entities/vehiculo.entity';
import { Asociacione } from '../asociaciones/entities/asociacione.entity';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([Asociacione, Tuc, Vehiculo]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1h' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [TucController],
  providers: [TucService],
})
export class TucModule {}
