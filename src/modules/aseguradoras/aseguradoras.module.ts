import { Module } from '@nestjs/common';
import { AseguradorasService } from './aseguradoras.service';
import { AseguradorasController } from './aseguradoras.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserSistema } from '../user_sistemas/entities/user_sistema.entity';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Aseguradora } from './entities/aseguradora.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Aseguradora, UserSistema]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1h' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AseguradorasController],
  providers: [AseguradorasService],
})
export class AseguradorasModule {}
