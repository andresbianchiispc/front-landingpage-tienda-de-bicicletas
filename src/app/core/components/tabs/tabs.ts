import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-tabs',
  imports: [NgClass],
  templateUrl: './tabs.html',
  styleUrl: './tabs.css',
})
export class Tabs {
  constructor(private router: Router) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        const url = event.url;
        if (url === '/' || url === '') {
          this.seleccionado = [false, false, false, false];
        } else if (url.startsWith('/categoria') || url.startsWith('/articulo')) {
          this.seleccionado = [true, false, false, false];
        } else if (url === '/buscar') {
          this.seleccionado = [false, true, false, false];
        } else if (url === '/carrito') {
          this.seleccionado = [false, false, true, false];
        } else if (url === '/perfil') {
          this.seleccionado = [false, false, false, true];
        } else {
          this.seleccionado = [false, false, false, false];
        }
      }
    });
  }

  seleccionado = [false, false, false, false];

  navegar(direccion: string) {
    this.router.navigate([direccion]);
  }
}
