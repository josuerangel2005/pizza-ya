import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth';
import { IngredientesModule } from './ingredientes/ingredientes.module';

@Module({
  imports: [AuthModule, IngredientesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
