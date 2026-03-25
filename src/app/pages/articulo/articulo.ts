import { Component, inject, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { ProductosServices } from '../../core/services/productos.services';
import { Producto } from '../../core/interfaces/productos';
import { CommonModule } from '@angular/common';
import { HeaderService } from '../../core/services/header.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-articulo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './articulo.html',
  styleUrl: './articulo.css',
})
export class Articulo implements OnInit, OnDestroy {
  route = inject(ActivatedRoute);
  router = inject(Router);
  productosService = inject(ProductosServices);
  headerService = inject(HeaderService);
  cdr = inject(ChangeDetectorRef);

  producto: Producto | undefined;
  mostrarSpecs: boolean = false;
  agregado: boolean = false;
  editando = false;
  nombreEdicion = '';
  precioEdicion: number | null = null;
  fotoEdicion = '';
  specsEdicion = '';
  esVistaAdminPendiente = false;

  ngOnInit() {
    this.route.params.subscribe(async (params) => {
      const id = Number(params['id']);
      this.esVistaAdminPendiente =
        this.esAdmin && this.route.snapshot.queryParamMap.get('adminVista') === 'pendiente';

      try {
        const data = await this.productosService.getProductoConCategoria(id, {
          incluirPendientesAdmin: this.esVistaAdminPendiente,
        });
        if (data) {
          this.producto = data.producto;
          if (this.headerService.titulo() !== data.categoria) {
            this.headerService.titulo.set(data.categoria);
          }
        } else {
          this.producto = undefined;
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

  get esAdmin() {
    return this.headerService.rolSesion() === 'admin';
  }

  iniciarEdicion() {
    if (!this.producto) return;
    this.editando = true;
    this.nombreEdicion = this.producto.nombre;
    this.precioEdicion = this.producto.precio;
    this.fotoEdicion = this.producto.fotoUrl;
    this.specsEdicion = this.producto.especificaciones.join(', ');
  }

  cancelarEdicion() {
    this.editando = false;
    this.nombreEdicion = '';
    this.precioEdicion = null;
    this.fotoEdicion = '';
    this.specsEdicion = '';
  }

  guardarEdicion() {
    if (!this.producto) return;
    if (!this.nombreEdicion.trim() || !this.precioEdicion || !this.fotoEdicion.trim()) return;

    const especificaciones = this.specsEdicion
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item.length > 0);

    const productoActualizado: Producto = {
      ...this.producto,
      nombre: this.nombreEdicion.trim(),
      precio: this.precioEdicion,
      fotoUrl: this.fotoEdicion.trim(),
      especificaciones: especificaciones.length > 0 ? especificaciones : this.producto.especificaciones,
    };

    this.headerService.guardarEdicionProducto(productoActualizado);
    this.producto = productoActualizado;
    this.cancelarEdicion();
  }

  ocultarProducto() {
    if (!this.esAdmin || !this.producto) return;
    const confirmar = window.confirm(
      `¿Querés quitar del catálogo a "${this.producto.nombre}"?`
    );
    if (!confirmar) return;
    this.headerService.ocultarProducto(this.producto);
    void this.router.navigate(['/dashboard']);
  }

  ngOnDestroy() {
    this.headerService.titulo.set('');
  }
}