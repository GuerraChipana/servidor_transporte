import { Module } from '@nestjs/common';
import { BusquedaService } from './busqueda.service';
import { BusquedaController } from './busqueda.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vehiculo } from '../vehiculos/entities/vehiculo.entity';
import { Empadronamiento } from '../empadronamiento/entities/empadronamiento.entity';
import { VehiculoSeguro } from '../vehiculo-seguros/entities/vehiculo-seguro.entity';
import { Asociacione } from '../asociaciones/entities/asociacione.entity';
import { Tuc } from '../tuc/entities/tuc.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Vehiculo, Empadronamiento,VehiculoSeguro,Asociacione,Tuc])],
  controllers: [BusquedaController],
  providers: [BusquedaService],
})
export class BusquedaModule {}
