import { Component, Inject } from '@angular/core';
import { HeaderService } from '../../services/header.service';

@Component({
  selector: 'app-perfil',
  imports: [],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css',
})
export class Perfil {
  constructor(@Inject(HeaderService) private headerService: HeaderService) {}

  ngOnInit(): void {
    this.headerService.titulo.set('Tienda de Bicicletas - Perfil');
  }
}
