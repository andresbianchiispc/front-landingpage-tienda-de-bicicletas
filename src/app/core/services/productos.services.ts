import { Injectable, inject } from '@angular/core';
import { Categoria } from '../interfaces/categorias';
import { Producto } from '../interfaces/productos';
import { HeaderService } from './header.service';

@Injectable({
  providedIn: 'root',
})
export class ProductosServices {
  private readonly JSON_URL = '/assets/data/database.json';
  private readonly headerService = inject(HeaderService);

  private aplicarEdicion(producto: Producto): Producto {
    const editado = this.headerService.obtenerProductoEditado(producto.id);
    return editado ? { ...producto, ...editado } : producto;
  }

  private esVisible(productoId: number): boolean {
    return !this.headerService.esProductoOculto(productoId);
  }

  // 1. Obtener productos de una categoría específica
  async getByCategoria(id: number): Promise<Producto[]> {
    const res = await fetch(this.JSON_URL);
    const data = await res.json();
    const categorias: Categoria[] = data.categorias || data;

    const categoriaEncontrada = categorias.find((cat) => cat.id === id);
    const productosBase = categoriaEncontrada
      ? categoriaEncontrada.productos.map((producto) => ({ ...producto, id: Number(producto.id) }))
      : [];

    const publicacionesUsuario = this.headerService
      .publicacionesAprobadas()
      .filter((producto) => producto.categoriaId === id);

    const productosVisibles = [...publicacionesUsuario, ...productosBase]
      .map((producto) => this.aplicarEdicion(producto))
      .filter((producto) => this.esVisible(producto.id));

    return productosVisibles;
  }

  // 2. Obtener un producto por ID (buscando en todas las categorías)
  async getById(id: number): Promise<Producto | undefined> {
    try {
      const publicacionUsuario = this.headerService
        .publicacionesAprobadas()
        .find((producto) => Number(producto.id) === id);

      if (publicacionUsuario) {
        const producto = this.aplicarEdicion(publicacionUsuario);
        if (!this.esVisible(producto.id)) {
          return undefined;
        }
        return producto;
      }

      const res = await fetch(this.JSON_URL);
      const data = await res.json();
      const categorias = data.categorias || data;

      for (const cat of categorias) {
        if (cat.productos) {
          const encontrado = cat.productos.find((p: any) => Number(p.id) === id);
          if (encontrado) {
            const producto = this.aplicarEdicion({ ...encontrado, id: Number(encontrado.id) });
            if (!this.esVisible(producto.id)) {
              return undefined;
            }
            return producto;
          }
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
    opciones?: { incluirPendientesAdmin?: boolean }
  ): Promise<{ producto: Producto; categoria: string } | null> {
    try {
      if (opciones?.incluirPendientesAdmin && this.headerService.rolSesion() === 'admin') {
        const publicacionPendiente = this.headerService
          .publicacionesPendientes()
          .find((producto) => Number(producto.id) === id);

        if (publicacionPendiente) {
          const categoria = await this.getNombreById(publicacionPendiente.categoriaId || 0);
          const producto = this.aplicarEdicion(publicacionPendiente);
          return {
            producto,
            categoria: categoria || 'Publicación pendiente',
          };
        }
      }

      const publicacionUsuario = this.headerService
        .publicacionesAprobadas()
        .find((producto) => Number(producto.id) === id);

      if (publicacionUsuario) {
        const categoria = await this.getNombreById(publicacionUsuario.categoriaId || 0);
        const producto = this.aplicarEdicion(publicacionUsuario);
        if (!this.esVisible(producto.id)) {
          return null;
        }
        return {
          producto,
          categoria: categoria || 'Publicaciones de usuarios',
        };
      }

      const res = await fetch(this.JSON_URL);
      const data = await res.json();
      const categorias: any[] = data.categorias || data;

      for (const cat of categorias) {
        const encontrado = cat.productos.find((p: any) => Number(p.id) === id);
        if (encontrado) {
          const producto = this.aplicarEdicion({ ...encontrado, id: Number(encontrado.id) });
          if (!this.esVisible(producto.id)) {
            return null;
          }
          return {
            producto,
            categoria: cat.nombre,
          };
        }
      }
      return null;
    } catch (e) {
      return null;
    }
  }
}