import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProductosServices } from '../../core/services/productos.services';
import { Producto } from '../../core/interfaces/productos';
import { CommonModule } from '@angular/common';
import { HeaderService } from '../../services/header.service';

@Component({
  selector: 'app-articulo',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './articulo.html',
  styleUrl: './articulo.css',
})
// ... imports
export class Articulo implements OnInit {
  route = inject(ActivatedRoute);
  productosService = inject(ProductosServices);
  headerService = inject(HeaderService);
  cdr = inject(ChangeDetectorRef);

  producto: Producto | undefined;
  mostrarSpecs: boolean = false;

  // articulo.ts

  ngOnInit() {
    this.route.params.subscribe(async (params) => {
      const id = Number(params['id']);

      // 1. NO limpies el header aquí (borra el this.headerService.titulo.set(''))
      // Esto evita que el título desaparezca un segundo mientras carga el JSON.

      try {
        const data = await this.productosService.getProductoConCategoria(id);

        if (data) {
          this.producto = data.producto;

          // 2. Solo actualizamos si el título es distinto al que ya está puesto
          // Esto previene el parpadeo si ya venías de la misma categoría
          if (this.headerService.titulo() !== data.categoria) {
            this.headerService.titulo.set(data.categoria);
          }
        }
      } catch (error) {
        console.error('Error cargando artículo', error);
      }

      this.cdr.detectChanges();
    });
  }

  irAtras() {
    window.history.back(); // Función simple para el botón volver
  }

  ngOnDestroy() {
    // Al salir del producto, limpiamos para que el siguiente componente reciba el header vacío
    this.headerService.titulo.set('');
  }
}
