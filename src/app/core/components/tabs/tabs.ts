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
        switch (event.url) {
          case 'categoria':
            this.seleccionado = [true, false, false, false];
            break;
          case '/buscar':
            this.seleccionado = [false, true, false, false];
            break;
          case '/carrito':
            this.seleccionado = [false, false, true, false];
            break;
          case '/perfil':
            this.seleccionado = [false, false, false, true];
            break;
          default:
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
