# Estableciendo la imagen base de Node.js
FROM node:20.11.0

# Creacion de directorio de trabajo en el contenedor
WORKDIR /usr/src/app

# Copia de los archivos de definición de paquetes al directorio de trabajo
COPY package.json ./
COPY package-lock.json ./

# Instalar dependencias del proyecto
RUN npm install

# Copiar todos los archivos del proyecto al directorio de trabajo
COPY . .

# Construir la aplicación para producción
RUN npm run build

# Exponer el puerto que utiliza tu aplicación
EXPOSE 8000

# Comando para ejecutar la aplicación
CMD ["node", "dist/src/main"]