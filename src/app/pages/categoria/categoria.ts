import { Component, inject, OnInit, ChangeDetectorRef, NgZone, OnDestroy } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProductosServices } from '../../core/services/productos.services';
import { Producto } from '../../core/interfaces/productos';
import { CommonModule } from '@angular/common';
import { ViewEncapsulation } from '@angular/core';
import { HeaderService } from '../../services/header.service';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';

@Component({
  selector: 'app-categoria',
  standalone: true,
  imports: [CommonModule, RouterLink],
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
}
