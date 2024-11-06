import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserSistema } from './entities/user_sistema.entity';
import { UserSistemasController } from './user_sistemas.controller';
import { UserSistemasService } from './user_sistemas.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserSistema]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1h' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [UserSistemasController],
  providers: [UserSistemasService],
  exports: [
    UserSistemasService,
    TypeOrmModule.forFeature([UserSistema]),
    JwtModule,
  ],
})
export class UserSistemasModule {}
