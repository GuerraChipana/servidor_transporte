import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { UserSistemasModule } from './modules/user_sistemas/user_sistemas.module';
import { AuthModule } from './modules/auth/auth.module';
import { join } from 'path';
import { PersonasModule } from './modules/personas/personas.module';
import { ImagenesModule } from './modules/imagenes/imagenes.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { AsociacionesModule } from './modules/asociaciones/asociaciones.module';

@Module({
  imports: [
    AuthModule,
    UserSistemasModule,
    PersonasModule,
    ImagenesModule,
    ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'mysql',
        host: process.env.DB_HOST,
        port: +process.env.DB_PORT,
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        entities: [join(__dirname, '**/*.entity.{ts,js}')],
        synchronize: false,
      }),
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'imagenes'), // Ruta donde se almacenan las imágenes
      serveRoot: '/imagenes/', // Ruta base para acceder a las imágenes
    }),
    AsociacionesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
