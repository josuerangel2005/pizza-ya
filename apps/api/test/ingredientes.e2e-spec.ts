import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('GET /ingredientes/stock-bajo (e2e)', () => {
  let app: INestApplication;
  let token: string;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    const sesion = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ usuario: 'operador', contrasena: 'pizza-ya' })
      .expect(201);
    token = sesion.body.accessToken;
  });

  afterEach(async () => {
    await app.close();
  });

  it('con token válido devuelve 200 con una lista JSON de ingredientes', async () => {
    const respuesta = await request(app.getHttpServer())
      .get('/ingredientes/stock-bajo')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect('Content-Type', /json/);

    expect(Array.isArray(respuesta.body)).toBe(true);
    expect(respuesta.body.length).toBeGreaterThan(0);
  });

  it('cada ingrediente trae nombre, cantidad y mínimo con cantidad menor que mínimo', async () => {
    const respuesta = await request(app.getHttpServer())
      .get('/ingredientes/stock-bajo')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    for (const ingrediente of respuesta.body) {
      expect(typeof ingrediente.nombre).toBe('string');
      expect(typeof ingrediente.cantidad).toBe('number');
      expect(typeof ingrediente.minimo).toBe('number');
      expect(ingrediente.cantidad).toBeLessThan(ingrediente.minimo);
    }
  });
});
