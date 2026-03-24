import { Component, inject, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductosServices } from '../../core/services/productos.services';
import { Producto } from '../../core/interfaces/productos';
import { CommonModule } from '@angular/common';
import { HeaderService } from '../../core/services/header.service';

@Component({
  selector: 'app-articulo',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './articulo.html',
  styleUrl: './articulo.css',
})
export class Articulo implements OnInit, OnDestroy {
  route = inject(ActivatedRoute);
  productosService = inject(ProductosServices);
  headerService = inject(HeaderService);
  cdr = inject(ChangeDetectorRef);

  producto: Producto | undefined;
  mostrarSpecs: boolean = false;
  agregado: boolean = false;

  ngOnInit() {
    this.route.params.subscribe(async (params) => {
      const id = Number(params['id']);
      try {
        const data = await this.productosService.getProductoConCategoria(id);
        if (data) {
          this.producto = data.producto;
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
    window.history.back();
  }

  agregarAlCarrito() {
    if (!this.producto) return;
    this.headerService.agregarAlCarrito(this.producto);
    this.agregado = true;
    setTimeout(() => (this.agregado = false), 1500);
  }

  ngOnDestroy() {
    this.headerService.titulo.set('');
  }
}