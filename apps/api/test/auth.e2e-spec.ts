import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { JwtService } from '../src/auth/jwt.service';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Autenticación (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
    );
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('POST /auth/login con credenciales válidas devuelve un token de acceso', async () => {
    const respuesta = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ usuario: 'operador', contrasena: 'pizza-ya' })
      .expect(201)
      .expect('Content-Type', /json/);

    expect(typeof respuesta.body.accessToken).toBe('string');
    expect(respuesta.body.accessToken.length).toBeGreaterThan(0);
  });

  it('POST /auth/login con credenciales inválidas devuelve 401 sin exponer detalles internos', async () => {
    const respuesta = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ usuario: 'operador', contrasena: 'incorrecta' })
      .expect(401);

    expect(respuesta.body.message).toMatch(/incorrectos/i);
  });

  it('POST /auth/login sin campos obligatorios devuelve 400 con un mensaje claro', async () => {
    const respuesta = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ usuario: 'operador' })
      .expect(400);

    expect(respuesta.body.statusCode).toBe(400);
    expect(JSON.stringify(respuesta.body.message)).toMatch(/contrasena/i);
  });

  it('GET /ingredientes/stock-bajo sin token devuelve 401', async () => {
    const respuesta = await request(app.getHttpServer())
      .get('/ingredientes/stock-bajo')
      .expect(401);

    expect(respuesta.body.statusCode).toBe(401);
    expect(respuesta.body.message).toBeTruthy();
  });

  it('GET /ingredientes/stock-bajo con token inválido devuelve 401', async () => {
    await request(app.getHttpServer())
      .get('/ingredientes/stock-bajo')
      .set('Authorization', 'Bearer token-falso')
      .expect(401);
  });

  it('GET /ingredientes/stock-bajo con token de un rol sin permiso devuelve 403', async () => {
    const jwtService = app.get(JwtService);
    const token = jwtService.firmar({ sub: 'otro', rol: 'proveedor' });

    const respuesta = await request(app.getHttpServer())
      .get('/ingredientes/stock-bajo')
      .set('Authorization', `Bearer ${token}`)
      .expect(403);

    expect(respuesta.body.statusCode).toBe(403);
    expect(respuesta.body.message).toBeTruthy();
  });
});
