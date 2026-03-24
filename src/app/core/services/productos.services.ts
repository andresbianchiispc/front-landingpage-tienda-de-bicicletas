import { Injectable } from '@angular/core';
import { Categoria } from '../interfaces/categorias';
import { Producto } from '../interfaces/productos';

@Injectable({
  providedIn: 'root',
})
export class ProductosServices {
  private readonly JSON_URL = '/assets/data/database.json';

  // 1. Obtener productos de una categoría específica
  async getByCategoria(id: number): Promise<Producto[]> {
    const res = await fetch(this.JSON_URL);
    const data = await res.json();
    const categorias: Categoria[] = data.categorias || data;

    const categoriaEncontrada = categorias.find((cat) => cat.id === id);
    return categoriaEncontrada ? categoriaEncontrada.productos : [];
  }

  // 2. Obtener un producto por ID (buscando en todas las categorías)
  async getById(id: number): Promise<Producto | undefined> {
    try {
      const res = await fetch(this.JSON_URL);
      const data = await res.json();
      const categorias = data.categorias || data;

      for (const cat of categorias) {
        if (cat.productos) {
          const encontrado = cat.productos.find((p: any) => Number(p.id) === id);
          if (encontrado) return encontrado;
        }
      }
      return undefined;
    } catch (e) {
      console.error('Error al cargar el producto', e);
      return undefined;
    }
  }

  // 3. Obtener el nombre de una categoría por su ID
  async getNombreById(id: number): Promise<string | null> {
    try {
      const res = await fetch(this.JSON_URL);
      const data = await res.json();
      const categorias: Categoria[] = data.categorias || data;

      const categoriaEncontrada = categorias.find((cat) => cat.id === id);
      return categoriaEncontrada ? categoriaEncontrada.nombre : null;
    } catch (e) {
      console.error('Error al obtener el nombre de la categoría', e);
      return null;
    }
  }

  // 4. Obtener Producto + Nombre de Categoría (Optimizado para el Header del detalle)
  async getProductoConCategoria(
    id: number,
  ): Promise<{ producto: Producto; categoria: string } | null> {
    try {
      const res = await fetch(this.JSON_URL);
      const data = await res.json();
      const categorias: any[] = data.categorias || data;

      for (const cat of categorias) {
        const encontrado = cat.productos.find((p: any) => Number(p.id) === id);
        if (encontrado) {
          return { producto: encontrado, categoria: cat.nombre };
        }
      }
      return null;
    } catch (e) {
      return null;
    }
  }
}