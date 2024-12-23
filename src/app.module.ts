import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { UserSistemasModule } from './modules/user_sistemas/user_sistemas.module';
import { AuthModule } from './modules/auth/auth.module';
import { join } from 'path';
import { PersonasModule } from './modules/personas/personas.module';
import { ImagenesModule } from './modules/imagenes/imagenes.module';
import { AsociacionesModule } from './modules/asociaciones/asociaciones.module';
import { AseguradorasModule } from './modules/aseguradoras/aseguradoras.module';
import { ConductoresModule } from './modules/conductores/conductores.module';
import { VehiculosModule } from './modules/vehiculos/vehiculos.module';
import { DetalleConductoresModule } from './modules/detalle_conductores/detalle_conductores.module';
import { VehiculoSegurosModule } from './modules/vehiculo-seguros/vehiculo-seguros.module';
import { TucModule } from './modules/tuc/tuc.module';
import { EmpadronamientoModule } from './modules/empadronamiento/empadronamiento.module';
import { BusquedaModule } from './modules/busqueda/busqueda.module';
import { AppController } from './app.controller';

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
   
    AsociacionesModule,
    AseguradorasModule,
    ConductoresModule,
    VehiculosModule,
    DetalleConductoresModule,
    VehiculoSegurosModule,
    TucModule,
    EmpadronamientoModule,
    BusquedaModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
