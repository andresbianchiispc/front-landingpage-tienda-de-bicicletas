import { Component, inject, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProductosServices } from '../../core/services/productos.services';
import { Producto } from '../../core/interfaces/productos';
import { CommonModule } from '@angular/common';
import { ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-categoria',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './categoria.html',
  styleUrl: './categoria.css',
  encapsulation: ViewEncapsulation.None,
})
export class Categoria implements OnInit {
  private ngZone = inject(NgZone);
  private cdr = inject(ChangeDetectorRef);
  private route = inject(ActivatedRoute);
  private productosService = inject(ProductosServices);

  productos: Producto[] = [];

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = Number(params['id']);
      
      // Forzamos a que todo lo asíncrono corra "dentro" de Angular
      this.ngZone.run(async () => {
        this.productos = []; // Limpiamos para feedback visual
        
        try {
          const nuevosProductos = await this.productosService.getByCategoria(id);
          this.productos = nuevosProductos;
          
          // Notificamos el cambio inmediatamente
          this.cdr.detectChanges();
          console.log("Paso a paso: Datos renderizados para ID", id);
        } catch (error) {
          console.error("Error cargando productos:", error);
        }
      });
    });
  }
}