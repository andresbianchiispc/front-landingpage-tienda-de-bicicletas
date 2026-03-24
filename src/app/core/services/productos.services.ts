import { Injectable } from '@angular/core';
import { Categoria } from '../interfaces/categorias';
import { Producto } from '../interfaces/productos';

@Injectable({
  providedIn: 'root',
})
export class ProductosServices {
  async getByCategoria(id: number): Promise<Producto[]> {
    // Usamos la ruta absoluta que es más segura
    const res = await fetch('/assets/data/database.json');
    const resJson: Categoria[] = await res.json();

    // Buscamos la categoría por ID
    const categoriaEncontrada = resJson.find((cat) => cat.id === id);

    // Ahora 'productos' sí existe en el tipo 'Categoria'
    return categoriaEncontrada ? categoriaEncontrada.productos : [];
  }

  // productos.services.ts

  async getById(id: number): Promise<Producto | undefined> {
    try {
      const res = await fetch('./assets/data/database.json');
      const data = await res.json();

      // Si el JSON tiene la raíz "categorias", la usamos; si no, usamos data directamente
      const categorias = data.categorias || data;

      // Buscamos el producto en todas las categorías
      for (const cat of categorias) {
        if (cat.productos) {
          // USAMOS Number(p.id) para que la comparación sea siempre entre números
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
}
