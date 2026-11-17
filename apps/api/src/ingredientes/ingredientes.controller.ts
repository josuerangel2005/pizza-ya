import { Controller, Get } from '@nestjs/common';
import { IngredientesService, Ingrediente } from './ingredientes.service';

@Controller('ingredientes')
export class IngredientesController {
  constructor(private readonly ingredientesService: IngredientesService) {}

  @Get('stock-bajo')
  obtenerStockBajo(): Ingrediente[] {
    return this.ingredientesService.obtenerStockBajo();
  }
}
