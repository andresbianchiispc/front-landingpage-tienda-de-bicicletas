import { Injectable, signal } from '@angular/core';
import { Producto } from '../interfaces/productos';

export interface ItemCarrito {
  producto: Producto;
  cantidad: number;
}

@Injectable({
  providedIn: 'root',
})
export class HeaderService {
  titulo = signal('Tienda de Bicicletas');
  extendido = signal(true);

  // --- Carrito ---
  private _items = signal<ItemCarrito[]>([]);
  items = this._items.asReadonly();

  get cantidadTotal(): number {
    return this._items().reduce((acc, i) => acc + i.cantidad, 0);
  }

  get precioTotal(): number {
    return this._items().reduce((acc, i) => acc + i.producto.precio * i.cantidad, 0);
  }

  agregarAlCarrito(producto: Producto) {
    const actuales = this._items();
    const existe = actuales.find((i) => i.producto.id === producto.id);
    if (existe) {
      this._items.set(
        actuales.map((i) =>
          i.producto.id === producto.id ? { ...i, cantidad: i.cantidad + 1 } : i
        )
      );
    } else {
      this._items.set([...actuales, { producto, cantidad: 1 }]);
    }
  }

  quitarDelCarrito(productoId: number) {
    const actuales = this._items();
    const item = actuales.find((i) => i.producto.id === productoId);
    if (!item) return;
    if (item.cantidad > 1) {
      this._items.set(
        actuales.map((i) =>
          i.producto.id === productoId ? { ...i, cantidad: i.cantidad - 1 } : i
        )
      );
    } else {
      this._items.set(actuales.filter((i) => i.producto.id !== productoId));
    }
  }

  eliminarDelCarrito(productoId: number) {
    this._items.set(this._items().filter((i) => i.producto.id !== productoId));
  }

  vaciarCarrito() {
    this._items.set([]);
  }
}