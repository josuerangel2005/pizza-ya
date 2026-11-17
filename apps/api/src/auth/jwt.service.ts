import { createHmac, timingSafeEqual } from 'node:crypto';

export class TokenInvalidoError extends Error {
  constructor() {
    super('El token de acceso es inválido o expiró');
    this.name = 'TokenInvalidoError';
  }
}

const VIGENCIA_SEGUNDOS = 3600;

function codificar(valor: string): string {
  return Buffer.from(valor, 'utf8').toString('base64url');
}

function decodificar(valor: string): string {
  return Buffer.from(valor, 'base64url').toString('utf8');
}

function compararSeguras(a: string, b: string): boolean {
  const bufferA = Buffer.from(a, 'utf8');
  const bufferB = Buffer.from(b, 'utf8');
  if (bufferA.length !== bufferB.length) {
    return false;
  }
  return timingSafeEqual(bufferA, bufferB);
}

export class JwtService {
  private readonly secreto: string;

  constructor(secreto?: string) {
    const valor = secreto ?? process.env.JWT_SECRET;
    if (!valor) {
      throw new Error(
        'La variable de entorno JWT_SECRET es obligatoria para firmar y verificar tokens',
      );
    }
    this.secreto = valor;
  }

  firmar(cargaUtil: Record<string, unknown>): string {
    const encabezado = codificar(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const cuerpo = codificar(
      JSON.stringify({
        ...cargaUtil,
        exp: Math.floor(Date.now() / 1000) + VIGENCIA_SEGUNDOS,
      }),
    );
    const firma = this.firmarSeccion(`${encabezado}.${cuerpo}`);
    return `${encabezado}.${cuerpo}.${firma}`;
  }

  verificar(token: string): Record<string, unknown> {
    const partes = token.split('.');
    if (partes.length !== 3) {
      throw new TokenInvalidoError();
    }
    const [encabezado, cuerpo, firma] = partes;
    if (
      !compararSeguras(this.firmarSeccion(`${encabezado}.${cuerpo}`), firma)
    ) {
      throw new TokenInvalidoError();
    }
    let cargaUtil: Record<string, unknown>;
    try {
      cargaUtil = JSON.parse(decodificar(cuerpo));
    } catch {
      throw new TokenInvalidoError();
    }
    if (
      typeof cargaUtil.exp !== 'number' ||
      cargaUtil.exp * 1000 <= Date.now()
    ) {
      throw new TokenInvalidoError();
    }
    return cargaUtil;
  }

  private firmarSeccion(contenido: string): string {
    return createHmac('sha256', this.secreto)
      .update(contenido, 'utf8')
      .digest('base64url');
  }
}
