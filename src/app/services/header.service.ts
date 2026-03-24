import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class HeaderService {
  constructor() {}

  titulo = signal('Tienda de Bicicletas');
  extendido = signal(true);
}
