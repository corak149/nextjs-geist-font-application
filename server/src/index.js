const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const winston = require('winston');
require('dotenv').config();

const connectDB = require('./config/database');
const authRoutes = require('./routes/auth');
const nfuRoutes = require('./routes/nfu');
const routesRoutes = require('./routes/routes');
const certificatesRoutes = require('./routes/certificates');

// Configuración del logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

// Inicializar app
const app = express();

// Middleware de seguridad
app.use(helmet());

// Configuración de CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Logging
app.use(morgan('dev'));

// Parseo de JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware para logging de errores
app.use((err, req, res, next) => {
  logger.error(err.stack);
  next(err);
});

// Rutas API
app.use('/api/auth', authRoutes);
app.use('/api/nfu', nfuRoutes);
app.use('/api/routes', routesRoutes);
app.use('/api/certificates', certificatesRoutes);

// Ruta principal
app.get('/', (req, res) => {
  res.json({
    message: 'Bienvenido a la API de Rueda Verde',
    status: 'Servidor funcionando correctamente',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      nfu: '/api/nfu',
      routes: '/api/routes',
      certificates: '/api/certificates'
    }
  });
});

// Ruta de verificación de estado
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date(),
    uptime: process.uptime()
  });
});

// Middleware para manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    mensaje: 'La ruta solicitada no existe'
  });
});

// Middleware para manejo de errores
app.use((err, req, res, next) => {
  logger.error(err.stack);

  // Manejar errores de validación de Mongoose
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Error de validación',
      mensaje: Object.values(err.errors).map(e => e.message)
    });
  }

  // Manejar errores de casting de Mongoose
  if (err.name === 'CastError') {
    return res.status(400).json({
      error: 'Error de formato',
      mensaje: 'Formato de ID inválido'
    });
  }

  // Manejar errores de duplicados de Mongoose
  if (err.code === 11000) {
    return res.status(400).json({
      error: 'Error de duplicado',
      mensaje: 'Ya existe un registro con esos datos'
    });
  }

  // Error genérico
  res.status(500).json({
    error: 'Error del servidor',
    mensaje: process.env.NODE_ENV === 'production' 
      ? 'Ha ocurrido un error en el servidor'
      : err.message
  });
});

// Verificar variables de entorno requeridas
const requiredEnvVars = [
  'PORT',
  'MONGODB_URI',
  'JWT_SECRET',
  'AWS_ACCESS_KEY_ID',
  'AWS_SECRET_ACCESS_KEY',
  'AWS_REGION',
  'AWS_S3_BUCKET'
];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  logger.error(`Variables de entorno faltantes: ${missingEnvVars.join(', ')}`);
  process.exit(1);
}

// Iniciar servidor
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Conectar a MongoDB
    await connectDB();
    logger.info('Conexión a MongoDB establecida');

    // Iniciar servidor
    app.listen(PORT, () => {
      logger.info(`Servidor iniciado en puerto ${PORT}`);
      logger.info(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    logger.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

// Manejo de señales de terminación
const gracefulShutdown = () => {
  logger.info('Iniciando apagado graceful...');
  server.close(() => {
    logger.info('Servidor HTTP cerrado.');
    mongoose.connection.close(false, () => {
      logger.info('Conexión MongoDB cerrada.');
      process.exit(0);
    });
  });
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Manejo de excepciones no capturadas
process.on('uncaughtException', (err) => {
  logger.error('Excepción no capturada:', err);
  gracefulShutdown();
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Rechazo no manejado en:', promise, 'razón:', reason);
  gracefulShutdown();
});

// Iniciar servidor
startServer();

module.exports = app;
