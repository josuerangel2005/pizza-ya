import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'operador',
    description: 'Nombre del usuario del sistema',
  })
  @IsString()
  @IsNotEmpty({ message: 'El campo usuario es obligatorio' })
  usuario!: string;

  @ApiProperty({ example: 'pizza-ya', description: 'Contraseña del usuario' })
  @IsString()
  @IsNotEmpty({ message: 'El campo contrasena es obligatorio' })
  contrasena!: string;
}
