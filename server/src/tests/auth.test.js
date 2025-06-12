const request = require('supertest');
const app = require('../index');
const mongoose = require('mongoose');
const User = require('../models/User');

describe('Auth Endpoints', () => {
  beforeAll(async () => {
    // Limpiar la base de datos antes de las pruebas
    await User.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('POST /api/auth/register', () => {
    const validUser = {
      nombre: 'Test User',
      email: 'test@example.com',
      password: 'Test123!',
      rol: 'generador',
      empresa: 'Test Company',
      telefono: '1234567890',
      direccion: 'Test Address 123',
      ciudad: 'Test City'
    };

    it('should create a new user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(validUser);

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body.usuario).toHaveProperty('nombre', validUser.nombre);
      expect(res.body.usuario).toHaveProperty('email', validUser.email);
      expect(res.body.usuario).not.toHaveProperty('password');
    });

    it('should not create user with existing email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(validUser);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error', 'Usuario ya existe');
    });

    it('should validate required fields', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({});

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error', 'Datos inválidos');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'Test123!'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body.usuario).toHaveProperty('email', 'test@example.com');
    });

    it('should not login with invalid password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        });

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('error', 'Credenciales inválidas');
    });

    it('should not login with non-existent email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'Test123!'
        });

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('error', 'Credenciales inválidas');
    });
  });

  describe('GET /api/auth/profile', () => {
    let token;

    beforeAll(async () => {
      // Login to get token
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'Test123!'
        });
      token = res.body.token;
    });

    it('should get user profile with valid token', async () => {
      const res = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.usuario).toHaveProperty('email', 'test@example.com');
    });

    it('should not get profile without token', async () => {
      const res = await request(app)
        .get('/api/auth/profile');

      expect(res.statusCode).toBe(401);
    });

    it('should not get profile with invalid token', async () => {
      const res = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer invalid-token');

      expect(res.statusCode).toBe(401);
    });
  });

  describe('PUT /api/auth/profile', () => {
    let token;

    beforeAll(async () => {
      // Login to get token
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'Test123!'
        });
      token = res.body.token;
    });

    it('should update user profile', async () => {
      const updates = {
        nombre: 'Updated Name',
        empresa: 'Updated Company'
      };

      const res = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .send(updates);

      expect(res.statusCode).toBe(200);
      expect(res.body.usuario).toHaveProperty('nombre', updates.nombre);
      expect(res.body.usuario).toHaveProperty('empresa', updates.empresa);
    });

    it('should not update email', async () => {
      const updates = {
        email: 'newemail@example.com'
      };

      const res = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .send(updates);

      expect(res.statusCode).toBe(200);
      expect(res.body.usuario.email).toBe('test@example.com');
    });
  });

  describe('POST /api/auth/change-password', () => {
    let token;

    beforeAll(async () => {
      // Login to get token
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'Test123!'
        });
      token = res.body.token;
    });

    it('should change password with valid current password', async () => {
      const res = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          passwordActual: 'Test123!',
          nuevaPassword: 'NewTest123!'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('mensaje', 'Contraseña actualizada exitosamente');
    });

    it('should not change password with invalid current password', async () => {
      const res = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          passwordActual: 'wrongpassword',
          nuevaPassword: 'NewTest123!'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error', 'Contraseña incorrecta');
    });
  });
});
