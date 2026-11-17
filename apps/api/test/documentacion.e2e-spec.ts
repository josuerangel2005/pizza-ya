import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { configurarDocumentacion } from '../src/documentacion';

describe('Documentación del contrato (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configurarDocumentacion(app);
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('GET /docs-json documenta GET /ingredientes/stock-bajo con autenticación y su esquema de respuesta', async () => {
    const respuesta = await request(app.getHttpServer())
      .get('/docs-json')
      .expect(200)
      .expect('Content-Type', /json/);

    const openapi = respuesta.body;
    const operacion = openapi?.paths?.['/ingredientes/stock-bajo']?.get;
    expect(operacion).toBeTruthy();

    expect(operacion.tags).toContain('ingredientes');

    const seguridad = operacion.security as Array<Record<string, unknown>>;
    expect(seguridad).toBeTruthy();
    expect(seguridad.some((requisito) => 'bearer' in requisito)).toBe(true);

    const esquemaRespuesta =
      operacion?.responses?.['200']?.content?.['application/json']?.schema;
    expect(esquemaRespuesta).toBeTruthy();
    expect(esquemaRespuesta.items?.$ref).toBe(
      '#/components/schemas/IngredienteResponseDto',
    );

    const esquemaIngrediente =
      openapi?.components?.schemas?.IngredienteResponseDto;
    expect(esquemaIngrediente).toBeTruthy();
    expect(Object.keys(esquemaIngrediente.properties)).toEqual(
      expect.arrayContaining(['nombre', 'cantidad', 'minimo']),
    );
  });
});
