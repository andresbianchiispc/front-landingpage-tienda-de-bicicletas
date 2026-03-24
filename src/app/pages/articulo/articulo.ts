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
  styleUrl: './articulo.css'
})
export class Articulo implements OnInit {
  route = inject(ActivatedRoute);
  productosService = inject(ProductosServices);
  headerService = inject(HeaderService);
  cdr = inject(ChangeDetectorRef);
  mostrarSpecs = false;

  producto?: Producto;

  ngOnInit() {
    this.route.params.subscribe(async (params) => {
      const id = Number(params['id']);
      
      // Buscamos el producto específico por su ID
      const res = await this.productosService.getById(id);
      this.producto = res;

      if (this.producto) {
        this.headerService.titulo.set(this.producto.nombre);
      }

      this.cdr.detectChanges();
    });
  }
}