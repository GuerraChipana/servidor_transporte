import { Module } from '@nestjs/common';
import { ConductoresService } from './conductores.service';
import { ConductoresController } from './conductores.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserSistema } from '../user_sistemas/entities/user_sistema.entity';
import { Persona } from '../personas/entities/persona.entity';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Conductore } from './entities/conductore.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Conductore, UserSistema, Persona]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1h' },
      }),
    }),
  ],
  controllers: [ConductoresController],
  providers: [ConductoresService],
})
export class ConductoresModule {}
