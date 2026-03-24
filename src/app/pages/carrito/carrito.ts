import { Component, Inject } from '@angular/core';
import { HeaderService } from '../../services/header.service';

@Component({
  selector: 'app-carrito',
  imports: [],
  templateUrl: './carrito.html',
  styleUrl: './carrito.css',
})
export class Carrito{
  constructor(@Inject(HeaderService) private headerService: HeaderService) {}

  ngOnInit(): void {
    this.headerService.titulo.set('Tienda de Bicicletas - Carrito');
  }
}
