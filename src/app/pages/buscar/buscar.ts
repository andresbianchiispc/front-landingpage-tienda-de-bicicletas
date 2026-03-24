import { Component, Inject } from '@angular/core';
import { HeaderService } from '../../services/header.service';

@Component({
  selector: 'app-buscar',
  imports: [],
  templateUrl: './buscar.html',
  styleUrl: './buscar.css',
})
export class Buscar {
  constructor(@Inject(HeaderService) private headerService: HeaderService) {}

  ngOnInit(): void {
    this.headerService.titulo.set('Tienda de Bicicletas - Buscar');
  }
}
