import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HeaderService } from '../../core/services/header.service';
import { CategoriasServices } from '../../core/services/categorias.services';
import { Categoria } from '../../core/interfaces/categorias';
import { Producto } from '../../core/interfaces/productos';

@Component({
  selector: 'app-publicar',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './publicar.html',
  styleUrl: './publicar.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Publicar {
  headerService = inject(HeaderService);
  private categoriasService = inject(CategoriasServices);

  categorias: Categoria[] = [];
  nombrePublicacion = '';
  precioPublicacion: number | null = null;
  fotoPublicacion = '';
  specsPublicacion = '';
  categoriaPublicacion = 1;
  errorPublicacion = '';
  publicada = false;

  constructor() {
    this.headerService.titulo.set('Publicar Producto');
    void this.cargarCategorias();
  }

  get esCliente() {
    return this.headerService.rolSesion() === 'usuario';
  }

  get emailCliente() {
    return this.headerService.emailSesion();
  }

  get totalPublicaciones() {
    return this.misPublicacionesPendientes.length + this.misPublicacionesAprobadas.length;
  }

  get misPublicacionesPendientes() {
    const usuario = this.headerService.emailSesion();
    return this.headerService
      .publicacionesPendientes()
      .filter((item) => item.publicadoPor === usuario);
  }

  get misPublicacionesAprobadas() {
    const usuario = this.headerService.emailSesion();
    return this.headerService
      .publicacionesAprobadas()
      .filter((item) => item.publicadoPor === usuario);
  }

  publicarProducto() {
    this.errorPublicacion = '';
    this.publicada = false;

    if (!this.esCliente) {
      this.errorPublicacion = 'Necesitás iniciar sesión como cliente para publicar.';
      return;
    }

    if (!this.nombrePublicacion.trim()) {
      this.errorPublicacion = 'El nombre del producto es obligatorio';
      return;
    }

    if (!this.precioPublicacion || this.precioPublicacion <= 0) {
      this.errorPublicacion = 'Ingresá un precio válido';
      return;
    }

    if (!this.fotoPublicacion.trim()) {
      this.errorPublicacion = 'Ingresá una URL de imagen';
      return;
    }

    const especificaciones = this.specsPublicacion
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item.length > 0);

    if (especificaciones.length === 0) {
      this.errorPublicacion = 'Agregá al menos una especificación';
      return;
    }

    const producto: Producto = {
      id: Date.now(),
      nombre: this.nombrePublicacion.trim(),
      precio: this.precioPublicacion,
      fotoUrl: this.fotoPublicacion.trim(),
      especificaciones,
    };

    this.headerService.publicarProductoUsuario(producto, this.categoriaPublicacion);
    this.nombrePublicacion = '';
    this.precioPublicacion = null;
    this.fotoPublicacion = '';
    this.specsPublicacion = '';
    this.publicada = true;
  }

  private async cargarCategorias() {
    this.categorias = await this.categoriasService.getAll();
    if (this.categorias.length > 0) {
      this.categoriaPublicacion = this.categorias[0].id;
    }
  }
}
