import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';

const USUARIO_DEMO = process.env.AUTH_USUARIO ?? 'operador';
const CONTRASENA_DEMO = process.env.AUTH_CONTRASENA ?? 'pizza-ya';
const ROL_DEMO = 'operador';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  iniciarSesion(credenciales: LoginDto): { accessToken: string } {
    if (
      credenciales.usuario !== USUARIO_DEMO ||
      credenciales.contrasena !== CONTRASENA_DEMO
    ) {
      throw new UnauthorizedException('Usuario o contraseña incorrectos');
    }
    return {
      accessToken: this.jwtService.sign({
        sub: credenciales.usuario,
        rol: ROL_DEMO,
      }),
    };
  }
}
