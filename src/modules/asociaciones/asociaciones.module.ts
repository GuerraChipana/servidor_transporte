import { Module } from '@nestjs/common';
import { AsociacionesService } from './asociaciones.service';
import { AsociacionesController } from './asociaciones.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Asociacione } from './entities/asociacione.entity';
import { UserSistema } from '../user_sistemas/entities/user_sistema.entity';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([Asociacione, UserSistema]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1h' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AsociacionesController],
  providers: [AsociacionesService],
})
export class AsociacionesModule {}
