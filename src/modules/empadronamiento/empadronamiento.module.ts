import { Module } from '@nestjs/common';
import { EmpadronamientoService } from './empadronamiento.service';
import { EmpadronamientoController } from './empadronamiento.controller';
import { Empadronamiento } from './entities/empadronamiento.entity';
import { UserSistema } from '../user_sistemas/entities/user_sistema.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Vehiculo } from '../vehiculos/entities/vehiculo.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Vehiculo, UserSistema, Empadronamiento]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1h' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [EmpadronamientoController],
  providers: [EmpadronamientoService],
})
export class EmpadronamientoModule {}
