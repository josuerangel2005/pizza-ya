import { IngredientesService } from './ingredientes.service';

describe('IngredientesService', () => {
  let service: IngredientesService;

  beforeEach(() => {
    service = new IngredientesService();
  });

  it('el catálogo de ejemplo contiene ingredientes con su nombre, cantidad y mínimo', () => {
    for (const ingrediente of service.obtenerTodos()) {
      expect(typeof ingrediente.nombre).toBe('string');
      expect(typeof ingrediente.cantidad).toBe('number');
      expect(typeof ingrediente.minimo).toBe('number');
    }
  });

  it('obtenerStockBajo devuelve solo los ingredientes con cantidad menor que mínimo', () => {
    const stockBajo = service.obtenerStockBajo();
    expect(stockBajo.length).toBeGreaterThan(0);
    for (const ingrediente of stockBajo) {
      expect(ingrediente.cantidad).toBeLessThan(ingrediente.minimo);
    }
    const excluidos = service
      .obtenerTodos()
      .filter((ingrediente) => ingrediente.cantidad >= ingrediente.minimo);
    for (const ingrediente of excluidos) {
      expect(stockBajo).not.toContainEqual(ingrediente);
    }
  });
});
