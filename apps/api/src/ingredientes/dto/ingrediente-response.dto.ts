import { ApiProperty } from '@nestjs/swagger';

export class IngredienteResponseDto {
  @ApiProperty({
    example: 'Queso mozzarella',
    description: 'Nombre del ingrediente',
  })
  nombre!: string;

  @ApiProperty({
    example: 2,
    description: 'Cantidad disponible en el inventario',
  })
  cantidad!: number;

  @ApiProperty({
    example: 5,
    description: 'Cantidad mínima que debe haber en stock',
  })
  minimo!: number;
}
