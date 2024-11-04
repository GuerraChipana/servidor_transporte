import {
  Controller,
  Post,
  Delete,
  Put,
  Get,
  Param,
  UseInterceptors,
  Res,
  HttpStatus,
  HttpCode,
  Body,
  BadRequestException,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImagenesService } from './imagenes.service';
import { Response } from 'express';
import { ApiTags, ApiResponse, ApiBody } from '@nestjs/swagger';
import { ImagenBase64DTO } from './dto/imagen_base64.dto';
import { ImagenDTO } from './dto/imagen.dto';

@ApiTags('Endpoints para manejar imágenes')
@Controller('imagenes')
export class ImagenesController {
  constructor(private readonly imagenesService: ImagenesService) {}

  @Post('subir-base64')
  @ApiBody({ description: 'Imagen en formato Base64', type: ImagenBase64DTO })
  @ApiResponse({ status: 201, description: 'Imagen subida exitosamente.' })
  @ApiResponse({ status: 400, description: 'Error al subir la imagen.' })
  async subirImagenBase64(
    @Body() imagenBase64DTO: ImagenBase64DTO,
    @Res() res: Response,
  ) {
    const fileName = `${imagenBase64DTO.dni}.jpg`;
    const subFolder = 'DNIs'; // Define la subcarpeta que desees

    try {
      const url = await this.imagenesService.uploadBase64Image(
        imagenBase64DTO.foto,
        fileName,
        subFolder, // Pasa la subcarpeta
      );
      return res.status(HttpStatus.CREATED).json({ url });
    } catch (error) {
      throw new BadRequestException(
        'Error al subir la imagen: ' + error.message,
      );
    }
  }

  @Post('subir')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('imagen'))
  @ApiBody({ description: 'Imagen a subir', type: ImagenDTO })
  @ApiResponse({ status: 201, description: 'Imagen subida exitosamente.' })
  @ApiResponse({ status: 400, description: 'Error al subir la imagen.' })
  async subirImagen(
    @UploadedFile() file: Express.Multer.File,
    @Res() res: Response,
  ) {
    const subFolder = 'General'; // Define la subcarpeta que desees

    try {
      const url = await this.imagenesService.uploadImage(file, subFolder); // Pasa la subcarpeta
      return res.status(HttpStatus.CREATED).json({ url });
    } catch (error) {
      throw new BadRequestException(
        'Error al subir la imagen: ' + error.message,
      );
    }
  }

  @Delete('eliminar/:subFolder/:fileName')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({ status: 204, description: 'Imagen eliminada exitosamente.' })
  @ApiResponse({ status: 404, description: 'Imagen no encontrada.' })
  async eliminarImagen(
    @Param('subFolder') subFolder: string,
    @Param('fileName') fileName: string,
    @Res() res: Response,
  ) {
    try {
      await this.imagenesService.deleteImage(fileName, subFolder); // Pasa la subcarpeta
      return res.status(HttpStatus.NO_CONTENT).send();
    } catch (error) {
      throw new BadRequestException(
        'Error al eliminar la imagen: ' + error.message,
      );
    }
  }

  @Put('editar/:subFolder/:oldFileName')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('imagen'))
  @ApiBody({ description: 'Nueva imagen para reemplazar', type: ImagenDTO })
  @ApiResponse({ status: 200, description: 'Imagen editada exitosamente.' })
  @ApiResponse({ status: 400, description: 'Error al editar la imagen.' })
  async editarImagen(
    @Param('subFolder') subFolder: string,
    @Param('oldFileName') oldFileName: string,
    @UploadedFile() newFile: Express.Multer.File,
    @Res() res: Response,
  ) {
    try {
      const url = await this.imagenesService.editImage(
        oldFileName,
        newFile,
        subFolder,
      ); // Pasa la subcarpeta
      return res.status(HttpStatus.OK).json({ url });
    } catch (error) {
      throw new BadRequestException(
        'Error al editar la imagen: ' + error.message,
      );
    }
  }

  @Get('descargar/:subFolder/:fileName')
  @ApiResponse({ status: 200, description: 'Imagen descargada exitosamente.' })
  @ApiResponse({ status: 404, description: 'Imagen no encontrada.' })
  async descargarImagen(
    @Param('subFolder') subFolder: string,
    @Param('fileName') fileName: string,
    @Res() res: Response,
  ) {
    try {
      const imageBuffer = await this.imagenesService.downloadImage(
        fileName,
        subFolder,
      ); // Pasa la subcarpeta
      res.set('Content-Type', 'image/jpeg');
      res.send(imageBuffer);
    } catch (error) {
      throw new BadRequestException(
        'Error al descargar la imagen: ' + error.message,
      );
    }
  }
}
