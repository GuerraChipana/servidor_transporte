import { Module } from '@nestjs/common';
import { ImagenesService } from './imagenes.service';

@Module({
  providers: [ImagenesService],
  controllers: [],
  exports: [ImagenesService],
})
export class ImagenesModule {}
