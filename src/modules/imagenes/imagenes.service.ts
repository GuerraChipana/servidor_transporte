import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import * as path from 'path';
import * as FTP from 'ftp';
import { Readable } from 'stream';
import * as multer from 'multer';

@Injectable()
export class ImagenesService {
  private ftpClient: FTP; // Instancia del cliente FTP/FTPS

  constructor() {
    this.ftpClient = new FTP(); // Crear nueva instancia del cliente FTP/FTPS
  }

  // Función para conectar al servidor FTPS
  private async connectFTP(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.ftpClient.connect({
        host: '198.72.127.150', // Dirección IP del servidor
        user: 'munitupacprueba', // Usuario FTPS
        password: 'j51_z5Th9', // Contraseña FTPS
        secure: true, // Usar FTPS
        secureOptions: { rejectUnauthorized: false }, // Ignorar la verificación del certificado
        pasvTimeout: 30000, // Timeout para la conexión pasiva (30 segundos)
        connTimeout: 30000, // Timeout para la conexión FTP (30 segundos)
        timeout: 30000, // Timeout para la transferencia FTP (30 segundos)
      });

      this.ftpClient.on('ready', () => {
        console.log('Conexión FTPS lista');
        resolve();
      });

      this.ftpClient.on('error', (err) => {
        reject(new BadRequestException('Error al conectar al servidor FTPS: ' + err.message));
      });
    });
  }

  // Función para asegurarse de que la carpeta existe, o crearla si no
  private async ensureDirectoryExists(directory: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.ftpClient.mkdir(directory, true, (err) => {
        if (err) {
          reject(new BadRequestException('Error al crear/directorio en el servidor FTPS: ' + err.message));
        } else {
          console.log(`El directorio ${directory} está listo o fue creado.`);
          resolve();
        }
      });
    });
  }

  // Función para subir un archivo normal (JPG, PNG, etc.) y renombrarlo con el nombre que le pases
  public async subirFileNormal(
    file: Express.Multer.File,
    newFileName: string, // Recibimos el nuevo nombre del archivo
    subFolder: string = '', // Subcarpeta donde se almacenará la imagen
  ): Promise<string> {
    const validExtensions = ['.jpg', '.jpeg', '.png', '.gif'];
    const fileExtension = path.extname(file.originalname).toLowerCase();
    if (!validExtensions.includes(fileExtension)) {
      throw new BadRequestException('Solo se permiten archivos de imagen (.jpg, .png, .jpeg, .gif)');
    }

    try {
      await this.connectFTP(); // Conectar al servidor FTPS

      const remotePath = path.join(subFolder, `${newFileName}${fileExtension}`);

      // Asegurarse de que la carpeta donde se subirá el archivo existe, o crearla si no
      await this.ensureDirectoryExists(path.dirname(remotePath));

      // Convertir el buffer en un flujo legible
      const readableStream = Readable.from(file.buffer);

      // Usamos el método `put` para subir el archivo
      await new Promise<void>((resolve, reject) => {
        this.ftpClient.put(readableStream, remotePath, (err) => {
          if (err) {
            reject(new BadRequestException('Error al subir la imagen a FTPS: ' + err.message));
          } else {
            console.log(`Archivo subido exitosamente: ${remotePath}`);
            resolve();
          }
        });
      });

      const baseUrl = process.env.BASE_URL;
      return `${baseUrl}/${subFolder}/${newFileName}${fileExtension}`;
    } catch (error) {
      console.error('Error al subir la imagen a FTPS:', error);
      throw new BadRequestException('Error al subir la imagen a FTPS: ' + error.message);
    } finally {
      this.ftpClient.end(); // Cerramos la conexión FTP
    }
  }

  // Función para eliminar una imagen en FTPS
  public async eliminarImagen(
    fileName: string, // Nombre del archivo a eliminar
    subFolder: string = '', // Subcarpeta donde se encuentra la imagen
  ): Promise<string> {
    const remotePath = path.join(subFolder, fileName);

    try {
      await this.connectFTP(); // Conectar al servidor FTPS

      // Eliminar archivo desde el servidor FTPS
      await new Promise<void>((resolve, reject) => {
        this.ftpClient.delete(remotePath, (err) => {
          if (err) {
            reject(new NotFoundException(`La imagen ${fileName} no fue encontrada en el servidor FTPS`));
          } else {
            console.log(`Imagen ${fileName} eliminada correctamente`);
            resolve();
          }
        });
      });

      return `Imagen ${fileName} eliminada correctamente`;
    } catch (error) {
      console.error('Error al eliminar la imagen:', error);
      throw new NotFoundException(`La imagen ${fileName} no fue encontrada en el servidor FTPS`);
    } finally {
      this.ftpClient.end(); // Cerramos la conexión FTP
    }
  }

  // Función para subir un archivo a la carpeta FTPS
  public async uploadImage(
    file: Express.Multer.File,
    subFolder: string = '',
  ): Promise<string> {
    const remotePath = path.join(subFolder, file.originalname);

    try {
      await this.connectFTP(); // Conectar al servidor FTPS

      // Asegurarse de que la carpeta donde se subirá el archivo existe, o crearla si no
      await this.ensureDirectoryExists(path.dirname(remotePath));

      // Convertir el buffer en un flujo legible
      const readableStream = Readable.from(file.buffer);

      // Usamos el método `put` para subir el archivo
      await new Promise<void>((resolve, reject) => {
        this.ftpClient.put(readableStream, remotePath, (err) => {
          if (err) {
            reject(new BadRequestException('Error al subir la imagen a FTPS: ' + err.message));
          } else {
            console.log(`Archivo subido exitosamente: ${remotePath}`);
            resolve();
          }
        });
      });

      const baseUrl = process.env.BASE_URL;
      return `${baseUrl}/${subFolder}/${file.originalname}`;
    } catch (error) {
      console.error('Error al subir la imagen a FTPS:', error);
      throw new BadRequestException('Error al subir la imagen a FTPS: ' + error.message);
    } finally {
      this.ftpClient.end(); // Cerramos la conexión FTP
    }
  }

  // Función para subir una imagen en Base64 a FTPS
  async uploadBase64Image(
    base64Image: string,
    fileName: string,
    subFolder: string = '',
  ): Promise<string> {
    // Verifica si la cadena ya contiene el prefijo
    if (!base64Image.startsWith('data:image/jpeg;base64,')) {
      base64Image = `data:image/jpeg;base64,${base64Image}`;
    }

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
      mimetype: 'image/jpeg', //
      buffer: imageBuffer,
      size: imageBuffer.length,
      stream: null,
      destination: '',
      filename: fileName,
      path: '',
    };

    return this.uploadImage(file, subFolder); // Llama a uploadImage con la subcarpeta
  }
}
