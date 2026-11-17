import { Body, Controller, Post } from '@nestjs/common';
import { ApiProperty, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

export class SesionDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'Token de acceso para usar en el encabezado Authorization',
  })
  accessToken!: string;
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  iniciarSesion(@Body() credenciales: LoginDto): SesionDto {
    return this.authService.iniciarSesion(credenciales);
  }
}
