import { Injectable } from '@angular/core';
import { Categoria } from '../interfaces/categorias';

@Injectable({
  providedIn: 'root'
})
export class CategoriasServices {
  private readonly JSON_URL = '/assets/data/database.json';

  async getAll(): Promise<Categoria[]> {
    try {
      const res = await fetch(this.JSON_URL);
      const data = await res.json();
      // El JSON puede ser un array directo o tener { categorias: [...] }
      return Array.isArray(data) ? data : (data.categorias ?? []);
    } catch (error) {
      console.error('Error al cargar las categorías:', error);
      return [];
    }
  }

  async getNombreById(id: number): Promise<string | null> {
    try {
      const categorias = await this.getAll();
      const categoria = categorias.find((cat) => cat.id === id);
      return categoria ? categoria.nombre : null;
    } catch (error) {
      console.error('Error al cargar la categoría por ID:', error);
      return null;
    }
  }
}