module.exports = {
    input: './dist/main.js', // Ruta a tu archivo principal
    output: './servidor_transporte.exe', // Ruta al archivo exe
    target: 'windows-x64', // El objetivo de la compilación
    build: true, // Compilar todo
    resources: [
      './dist/**/*', // Incluir todos los archivos en la carpeta dist
      './imagenes/**/*', // Incluir las imágenes
      './.env' // Incluir el archivo .env si es necesario
    ],
    flags: ['--no-precompiled']
  };
  