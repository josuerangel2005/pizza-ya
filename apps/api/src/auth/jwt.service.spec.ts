import { JwtService, TokenInvalidoError } from './jwt.service';

describe('JwtService', () => {
  afterEach(() => {
    process.env.JWT_SECRET = 'secreto-de-pruebas';
  });

  it('no arranca si la variable de entorno JWT_SECRET no está definida', () => {
    delete process.env.JWT_SECRET;
    expect(() => new JwtService()).toThrow(/JWT_SECRET/);
    process.env.JWT_SECRET = 'secreto-de-pruebas';
  });

  it('firma un token y lo verifica devolviendo la carga útil', () => {
    const servicio = new JwtService();
    const token = servicio.firmar({ sub: 'operador', rol: 'operador' });
    expect(token.split('.').length).toBe(3);

    const carga = servicio.verificar(token);
    expect(carga.sub).toBe('operador');
    expect(carga.rol).toBe('operador');
  });

  it('rechaza un token con la firma alterada', () => {
    const servicio = new JwtService();
    const token = servicio.firmar({ sub: 'operador', rol: 'operador' });
    const partes = token.split('.');
    const firmaAlterada = partes[2].replace(/[a-zA-Z0-9]/, 'A');
    expect(() =>
      servicio.verificar(`${partes[0]}.${partes[1]}.${firmaAlterada}`),
    ).toThrow(TokenInvalidoError);
  });

  it('rechaza un token mal formado', () => {
    const servicio = new JwtService();
    expect(() => servicio.verificar('no-es-un-token')).toThrow(
      TokenInvalidoError,
    );
  });

  it('rechaza un token expirado', () => {
    const servicio = new JwtService();
    const token = servicio.firmar({ sub: 'operador', rol: 'operador' });
    const [encabezado, cuerpo] = token.split('.');
    const carga = JSON.parse(Buffer.from(cuerpo, 'base64url').toString('utf8'));
    carga.exp = Math.floor(Date.now() / 1000) - 10;
    const cuerpoExpirado = Buffer.from(JSON.stringify(carga)).toString(
      'base64url',
    );
    expect(() =>
      servicio.verificar(
        `${encabezado}.${cuerpoExpirado}.${token.split('.')[2]}`,
      ),
    ).toThrow(TokenInvalidoError);
  });
});
