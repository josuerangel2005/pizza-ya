import { Injectable } from '@nestjs/common';

export interface Ingrediente {
  nombre: string;
  cantidad: number;
  minimo: number;
}

const INGREDIENTES_EJEMPLO: Ingrediente[] = [
  { nombre: 'Queso mozzarella', cantidad: 2, minimo: 5 },
  { nombre: 'Levadura', cantidad: 0, minimo: 3 },
  { nombre: 'Jamón', cantidad: 1, minimo: 4 },
  { nombre: 'Tomate', cantidad: 9, minimo: 8 },
  { nombre: 'Harina de trigo', cantidad: 25, minimo: 10 },
  { nombre: 'Aceite de oliva', cantidad: 6, minimo: 6 },
];

@Injectable()
export class IngredientesService {
  obtenerTodos(): Ingrediente[] {
    return [...INGREDIENTES_EJEMPLO];
  }

  obtenerStockBajo(): Ingrediente[] {
    return this.obtenerTodos().filter(
      (ingrediente) => ingrediente.cantidad < ingrediente.minimo,
    );
  }
}
