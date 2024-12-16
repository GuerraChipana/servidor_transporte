import { Module } from '@nestjs/common';
import { BusquedaService } from './busqueda.service';
import { BusquedaController } from './busqueda.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vehiculo } from '../vehiculos/entities/vehiculo.entity';
import { Empadronamiento } from '../empadronamiento/entities/empadronamiento.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Vehiculo, Empadronamiento])],
  controllers: [BusquedaController],
  providers: [BusquedaService],
})
export class BusquedaModule {}
