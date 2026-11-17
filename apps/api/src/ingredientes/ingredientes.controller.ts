import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard, Roles } from '../auth';
import { IngredientesService } from './ingredientes.service';
import { IngredienteResponseDto } from './dto/ingrediente-response.dto';

@ApiTags('ingredientes')
@ApiBearerAuth('bearer')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('operador')
@Controller('ingredientes')
export class IngredientesController {
  constructor(private readonly ingredientesService: IngredientesService) {}

  @Get('stock-bajo')
  @ApiOkResponse({
    type: IngredienteResponseDto,
    isArray: true,
    description: 'Ingredientes cuya cantidad está por debajo de su mínimo',
  })
  @ApiUnauthorizedResponse({
    description: 'Falta el token de acceso o es inválido',
  })
  @ApiForbiddenResponse({
    description: 'El rol del token no tiene permiso sobre el recurso',
  })
  obtenerStockBajo(): IngredienteResponseDto[] {
    return this.ingredientesService.obtenerStockBajo();
  }
}
