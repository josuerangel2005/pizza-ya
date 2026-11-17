import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export const ROLES_KEY = 'roles';

export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const rolesRequeridos = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!rolesRequeridos || rolesRequeridos.length === 0) {
      return true;
    }
    const usuario = context.switchToHttp().getRequest().usuario;
    if (!usuario || !rolesRequeridos.includes(usuario.rol)) {
      throw new ForbiddenException(
        'Tu rol no tiene permiso para acceder a este recurso',
      );
    }
    return true;
  }
}
