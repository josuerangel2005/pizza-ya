import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtService } from './jwt.service';

const CREDENCIALES_VALIDAS = { usuario: 'operador', contrasena: 'pizza-ya' };

const crearServicio = () =>
  new AuthService(new JwtService('secreto-de-pruebas'));

describe('AuthService', () => {
  afterEach(() => {
    process.env.AUTH_USUARIO = 'operador';
    process.env.AUTH_CONTRASENA = 'pizza-ya';
  });

  it('no arranca si AUTH_USUARIO o AUTH_CONTRASENA no están definidas', () => {
    delete process.env.AUTH_USUARIO;
    expect(() => crearServicio()).toThrow(/AUTH_USUARIO/);
    process.env.AUTH_USUARIO = 'operador';

    delete process.env.AUTH_CONTRASENA;
    expect(() => crearServicio()).toThrow(/AUTH_CONTRASENA/);
    process.env.AUTH_CONTRASENA = 'pizza-ya';
  });

  it('inicia sesión con credenciales válidas y devuelve un token de acceso', () => {
    const sesion = crearServicio().iniciarSesion(CREDENCIALES_VALIDAS);
    expect(typeof sesion.accessToken).toBe('string');
    expect(sesion.accessToken.length).toBeGreaterThan(0);
  });

  it('rechaza credenciales incorrectas sin exponer detalles internos', () => {
    expect(() =>
      crearServicio().iniciarSesion({
        usuario: 'operador',
        contrasena: 'incorrecta',
      }),
    ).toThrow(UnauthorizedException);
  });
});
