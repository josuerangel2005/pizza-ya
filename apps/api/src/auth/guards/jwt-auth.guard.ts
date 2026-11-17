import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const peticion = context.switchToHttp().getRequest();
    const autorizacion = peticion.headers['authorization'];
    if (!autorizacion?.startsWith('Bearer ')) {
      throw new UnauthorizedException(
        'Se requiere un token de acceso en el encabezado Authorization',
      );
    }
    const token = autorizacion.slice('Bearer '.length);
    try {
      peticion.usuario = this.jwtService.verify(token);
      return true;
    } catch {
      throw new UnauthorizedException(
        'El token de acceso es inválido o expiró',
      );
    }
  }
}
