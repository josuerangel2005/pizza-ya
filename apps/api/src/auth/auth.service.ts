import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { JwtService } from './jwt.service';

@Injectable()
export class AuthService {
  private readonly usuario: string;

  private readonly contrasena: string;

  constructor(private readonly jwtService: JwtService) {
    if (!process.env.AUTH_USUARIO || !process.env.AUTH_CONTRASENA) {
      throw new Error(
        'Las variables de entorno AUTH_USUARIO y AUTH_CONTRASENA son obligatorias',
      );
    }
    this.usuario = process.env.AUTH_USUARIO;
    this.contrasena = process.env.AUTH_CONTRASENA;
  }

  iniciarSesion(credenciales: LoginDto): { accessToken: string } {
    if (
      credenciales.usuario !== this.usuario ||
      credenciales.contrasena !== this.contrasena
    ) {
      throw new UnauthorizedException('Usuario o contraseña incorrectos');
    }
    return {
      accessToken: this.jwtService.firmar({
        sub: credenciales.usuario,
        rol: 'operador',
      }),
    };
  }
}
