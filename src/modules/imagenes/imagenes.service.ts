import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { promises as fs } from 'fs';
import { join } from 'path';

@Injectable()
export class ImagenesService {
  private readonly uploadDir = './imagenes'; // Directorio donde se almacenarán las imágenes

  constructor() {
    // Crea el directorio de imagenes si no existe
    fs.mkdir(this.uploadDir, { recursive: true }).catch((err) =>
      console.error(err),
    );
  }

  // Función para subir un archivo a la carpeta local
  public async uploadImage(
    file: Express.Multer.File,
    subFolder: string = '',
  ): Promise<string> {
    const dirPath = join(this.uploadDir, subFolder);
    await fs.mkdir(dirPath, { recursive: true }); // Crea la subcarpeta si no existe
    const filePath = join(dirPath, file.originalname);
    try {
      await fs.writeFile(filePath, file.buffer); // Escribe el archivo en el sistema
      return `${subFolder}/${file.originalname}`; // Retorna la ruta relativa
    } catch (error) {
      throw new BadRequestException(
        'Error al subir la imagen: ' + error.message,
      );
    }
  }

  // Función para subir una imagen en Base64
  async uploadBase64Image(
    base64Image: string,
    fileName: string,
    subFolder: string = '',
  ): Promise<string> {
    // Verifica si la cadena ya contiene el prefijo
    if (!base64Image.startsWith('data:image/jpeg;base64,')) {
      // Si no, añade el prefijo
      base64Image = `data:image/jpeg;base64,${base64Image}`;
    }

    // Validar formato de imagen Base64
    const base64Regex = /^data:image\/(jpeg|png|gif);base64,/;
    if (!base64Regex.test(base64Image)) {
      throw new BadRequestException('Formato de imagen no válido');
    }

    // Extraer datos de la cadena Base64
    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');

    const file: Express.Multer.File = {
      fieldname: 'imagen',
      originalname: fileName,
      encoding: '7bit',
      mimetype: 'image/jpeg', // Ajustar según el tipo real de la imagen
      buffer: imageBuffer,
      size: imageBuffer.length,
      stream: null,
      destination: '',
      filename: fileName,
      path: '',
    };

    return this.uploadImage(file, subFolder); // Llama a uploadImage con la subcarpeta
  }

  // Función para eliminar una imagen
  async deleteImage(fileName: string, subFolder: string = ''): Promise<void> {
    const filePath = join(this.uploadDir, subFolder, fileName);
    try {
      await fs.unlink(filePath); // Elimina el archivo del sistema
    } catch (error) {
      throw new NotFoundException('Imagen no encontrada');
    }
  }

  // Función para editar una imagen (reemplazar)
  async editImage(
    oldFileName: string,
    newFile: Express.Multer.File,
    subFolder: string = '',
  ): Promise<string> {
    await this.deleteImage(oldFileName, subFolder);
    return this.uploadImage(newFile, subFolder);
  }

  // Función para descargar una imagen
  async downloadImage(
    fileName: string,
    subFolder: string = '',
  ): Promise<Buffer> {
    const filePath = join(this.uploadDir, subFolder, fileName);
    try {
      return await fs.readFile(filePath); // Devuelve el buffer de la imagen
    } catch (error) {
      throw new NotFoundException(
        'Error al descargar la imagen: ' + error.message,
      );
    }
  }
}
