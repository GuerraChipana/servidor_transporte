import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios'; // Asegúrate de importar esto
import { JwtModule } from '@nestjs/jwt';
import { PersonaService } from './personas.service';
import { PersonasController } from './personas.controller';
import { ImagenesModule } from '../imagenes/imagenes.module';
import { Persona } from './entities/persona.entity';
import { UserSistema } from '../user_sistemas/entities/user_sistema.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([Persona, UserSistema]),
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
  controllers: [PersonasController],
  providers: [PersonaService],
})
export class PersonasModule {}
