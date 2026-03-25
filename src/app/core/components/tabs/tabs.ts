import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { NgClass } from '@angular/common';
import { HeaderService } from '../../services/header.service';

@Component({
  selector: 'app-tabs',
  imports: [NgClass],
  templateUrl: './tabs.html',
  styleUrl: './tabs.css',
})
export class Tabs {
  constructor(
    private router: Router,
    private headerService: HeaderService
  ) {
    this.actualizarSeleccion(this.router.url);

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.actualizarSeleccion(event.urlAfterRedirects || event.url);
      }
    });
  }

  seleccionado = [false, false, false, false];

  private actualizarSeleccion(urlActual: string) {
    const url = (urlActual || '').split('?')[0];

    if (url === '/' || url === '') {
      this.seleccionado = [true, false, false, false];
    } else if (url.startsWith('/categoria') || url.startsWith('/articulo')) {
      this.seleccionado = [true, false, false, false];
    } else if (url.startsWith('/buscar')) {
      this.seleccionado = [false, true, false, false];
    } else if (url.startsWith('/carrito')) {
      this.seleccionado = [false, false, true, false];
    } else if (
      url.startsWith('/perfil') ||
      url.startsWith('/dashboard') ||
      url.startsWith('/publicar')
    ) {
      this.seleccionado = [false, false, false, true];
    } else {
      this.seleccionado = [false, false, false, false];
    }
  }

  get etiquetaPerfil() {
    const rol = this.headerService.rolSesion();
    if (rol === 'admin') {
      return 'Dashboard';
    }
    if (rol === 'usuario') {
      return 'Publicar';
    }
    return 'Perfil';
  }

  navegar(direccion: string) {
    if (direccion === 'perfil') {
      const rol = this.headerService.rolSesion();
      if (rol === 'admin') {
        this.router.navigate(['/dashboard']);
        return;
      }
      if (rol === 'usuario') {
        this.router.navigate(['/publicar']);
        return;
      }
    }

    this.router.navigate([direccion]);
  }
}
