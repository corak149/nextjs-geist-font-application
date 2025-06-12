# Rueda Verde Server

Backend para la aplicación de gestión de NFU Rueda Verde.

## Requisitos

- Node.js >= 14.0.0
- Docker y Docker Compose
- MongoDB (se proporciona via Docker)

## Configuración

1. Clonar el repositorio
2. Copiar el archivo de configuración de ejemplo:
   ```bash
   cp .env.example .env
   ```
3. Modificar las variables de entorno en `.env` según sea necesario

## Instalación

1. Instalar dependencias:
   ```bash
   npm install
   ```

2. Iniciar MongoDB:
   ```bash
   docker-compose up -d
   ```

3. Iniciar el servidor en modo desarrollo:
   ```bash
   npm run dev
   ```

El servidor estará disponible en `http://localhost:5000`

## Variables de Entorno

- `PORT`: Puerto del servidor (default: 5000)
- `MONGODB_URI`: URI de conexión a MongoDB
- `JWT_SECRET`: Secreto para firmar tokens JWT
- `AWS_ACCESS_KEY_ID`: ID de acceso de AWS
- `AWS_SECRET_ACCESS_KEY`: Clave secreta de AWS
- `AWS_REGION`: Región de AWS
- `AWS_S3_BUCKET`: Nombre del bucket S3
- `FRONTEND_URL`: URL del frontend

## Endpoints API

### Health Check
- GET `/api/health`: Verifica el estado del servidor

### Autenticación
- POST `/api/auth/login`: Inicio de sesión
- POST `/api/auth/register`: Registro de usuario

### NFU (Neumáticos Fuera de Uso)
- GET `/api/nfu`: Listar NFUs
- POST `/api/nfu`: Crear NFU

### Rutas
- GET `/api/routes`: Listar rutas
- POST `/api/routes`: Crear ruta

### Certificados
- GET `/api/certificates`: Listar certificados
- POST `/api/certificates`: Generar certificado

## Scripts Disponibles

- `npm run dev`: Inicia el servidor en modo desarrollo
- `npm start`: Inicia el servidor en modo producción
- `npm test`: Ejecuta las pruebas
- `npm run lint`: Ejecuta el linter
- `npm run format`: Formatea el código

## Estructura del Proyecto

```
server/
├── src/
│   ├── config/         # Configuración
│   ├── controllers/    # Controladores
│   ├── middleware/     # Middleware
│   ├── models/         # Modelos
│   ├── routes/         # Rutas
│   └── index.js        # Punto de entrada
├── tests/              # Pruebas
├── .env.example        # Ejemplo de variables de entorno
├── docker-compose.yml  # Configuración de Docker
└── package.json        # Dependencias y scripts
