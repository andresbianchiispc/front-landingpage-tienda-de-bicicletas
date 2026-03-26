import { Component, inject } from '@angular/core';
import { HeaderService } from '../../services/header.service';
import { Router, RouterLink, RouterLinkActive } from "@angular/router";
import { ProductosServices } from '../../services/productos.services';
import { Producto } from '../../interfaces/productos';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  headerService = inject(HeaderService);
  private router = inject(Router);
  productosService = inject(ProductosServices);

  sugerencias: Producto[] = [];
  mostrarSugerencias = false;

  get haySesion() {
    return this.headerService.usuarioLogueado();
  }

  get emailSesion() {
    return this.headerService.emailSesion();
  }

  get etiquetaSesion() {
    return this.headerService.rolSesion() === 'admin' ? 'Administrador' : 'Cliente publicador';
  }

  cerrarSesion() {
    this.headerService.cerrarSesion();
    void this.router.navigate(['/perfil']);
  }

  async onSearchInput(event: any) {
    const q = event.target.value.trim().toLowerCase();
    if (!q) {
      this.sugerencias = [];
      this.mostrarSugerencias = false;
      return;
    }
    const allProducts = await this.productosService.getAll();
    this.sugerencias = allProducts.filter((p: Producto) => p.nombre.toLowerCase().includes(q)).slice(0, 5);
    this.mostrarSugerencias = this.sugerencias.length > 0;
  }

  ocultarSugerencias() {
    setTimeout(() => {
      this.mostrarSugerencias = false;
    }, 200);
  }

  irAlProducto(id: number) {
    this.mostrarSugerencias = false;
    void this.router.navigate(['/articulo', id]);
  }

  buscar(event: any) {
    const q = event.target.value;
    if (q) {
      this.mostrarSugerencias = false;
      void this.router.navigate(['/buscar'], { queryParams: { q } });
    }
  }
}
