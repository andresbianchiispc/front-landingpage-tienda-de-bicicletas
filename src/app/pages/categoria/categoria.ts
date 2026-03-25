import { Component, inject, OnInit, ChangeDetectorRef, NgZone, OnDestroy } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProductosServices } from '../../core/services/productos.services';
import { Producto } from '../../core/interfaces/productos';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ViewEncapsulation } from '@angular/core';
import { HeaderService } from '../../core/services/header.service';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';

@Component({
  selector: 'app-categoria',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './categoria.html',
  styleUrl: './categoria.css',
  encapsulation: ViewEncapsulation.None,
  animations: [
    trigger('listAnimation', [
      transition('* <=> *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(20px)' }),
          stagger('100ms', [
            animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true })
      ])
    ])
  ]
})
export class Categoria implements OnInit, OnDestroy {
  private ngZone = inject(NgZone);
  private cdr = inject(ChangeDetectorRef);
  private route = inject(ActivatedRoute);
  private productosService = inject(ProductosServices);
  private headerService = inject(HeaderService);

  productos: Producto[] = [];
  nombreCategoria: string = '';
  productoEditandoId: number | null = null;
  nombreEdicion = '';
  precioEdicion: number | null = null;
  fotoEdicion = '';
  specsEdicion = '';

  // categoria.ts

  ngOnInit() {
    this.route.params.subscribe((params) => {
      const id = Number(params['id']);

      this.ngZone.run(async () => {
        // 1. Mientras carga, podemos dejarlo vacío o poner "Cargando..."
        this.headerService.titulo.set('');

        try {
          const [nuevosProductos, nombre] = await Promise.all([
            this.productosService.getByCategoria(id),
            this.productosService.getNombreById(id),
          ]);

          this.productos = nuevosProductos;
          this.nombreCategoria = nombre || 'Categoría';

          // 2. ¡AQUÍ ES DONDE MANDAMOS EL NOMBRE AL HEADER!
          this.headerService.titulo.set(this.nombreCategoria);

          this.cdr.detectChanges();
        } catch (error) {
          console.error('Error:', error);
        }
      });
    });
  }

  ngOnDestroy() {
    // 3. SOLO limpiamos al salir de la sección de categorías
    this.headerService.titulo.set('');
  }

  get esAdmin() {
    return this.headerService.rolSesion() === 'admin';
  }

  iniciarEdicion(producto: Producto) {
    this.productoEditandoId = producto.id;
    this.nombreEdicion = producto.nombre;
    this.precioEdicion = producto.precio;
    this.fotoEdicion = producto.fotoUrl;
    this.specsEdicion = producto.especificaciones.join(', ');
  }

  cancelarEdicion() {
    this.productoEditandoId = null;
    this.nombreEdicion = '';
    this.precioEdicion = null;
    this.fotoEdicion = '';
    this.specsEdicion = '';
  }

  guardarEdicion(producto: Producto) {
    const especificaciones = this.specsEdicion
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item.length > 0);

    if (!this.nombreEdicion.trim() || !this.precioEdicion || !this.fotoEdicion.trim()) {
      return;
    }

    this.headerService.guardarEdicionProducto({
      ...producto,
      nombre: this.nombreEdicion.trim(),
      precio: this.precioEdicion,
      fotoUrl: this.fotoEdicion.trim(),
      especificaciones: especificaciones.length > 0 ? especificaciones : producto.especificaciones,
    });

    this.productos = this.productos.map((item) =>
      item.id === producto.id
        ? {
            ...item,
            nombre: this.nombreEdicion.trim(),
            precio: this.precioEdicion!,
            fotoUrl: this.fotoEdicion.trim(),
            especificaciones: especificaciones.length > 0 ? especificaciones : item.especificaciones,
          }
        : item
    );

    this.cancelarEdicion();
  }

  ocultarProducto(producto: Producto) {
    if (!this.esAdmin) return;
    const confirmar = window.confirm(`¿Querés quitar del catálogo a "${producto.nombre}"?`);
    if (!confirmar) return;
    this.headerService.ocultarProducto(producto);
    this.productos = this.productos.filter((item) => item.id !== producto.id);
  }
}
