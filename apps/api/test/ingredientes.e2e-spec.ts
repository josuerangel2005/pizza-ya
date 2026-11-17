import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { IngredientesModule } from '../src/ingredientes/ingredientes.module';

describe('GET /ingredientes/stock-bajo (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [IngredientesModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('devuelve 200 con una lista JSON de ingredientes', async () => {
    const respuesta = await request(app.getHttpServer())
      .get('/ingredientes/stock-bajo')
      .expect(200)
      .expect('Content-Type', /json/);

    expect(Array.isArray(respuesta.body)).toBe(true);
    expect(respuesta.body.length).toBeGreaterThan(0);
  });

  it('cada ingrediente trae nombre, cantidad y mínimo con cantidad menor que mínimo', async () => {
    const respuesta = await request(app.getHttpServer())
      .get('/ingredientes/stock-bajo')
      .expect(200);

    for (const ingrediente of respuesta.body) {
      expect(typeof ingrediente.nombre).toBe('string');
      expect(typeof ingrediente.cantidad).toBe('number');
      expect(typeof ingrediente.minimo).toBe('number');
      expect(ingrediente.cantidad).toBeLessThan(ingrediente.minimo);
    }
  });
});
