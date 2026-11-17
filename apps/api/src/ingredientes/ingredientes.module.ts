import { Module } from '@nestjs/common';
import { AuthModule } from '../auth';
import { IngredientesController } from './ingredientes.controller';
import { IngredientesService } from './ingredientes.service';

@Module({
  imports: [AuthModule],
  controllers: [IngredientesController],
  providers: [IngredientesService],
  exports: [IngredientesService],
})
export class IngredientesModule {}
