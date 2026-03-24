import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { HeaderService } from '../../core/services/header.service';
import { CategoriasServices } from '../../core/services/categorias.services';
import { Categoria } from '../../core/interfaces/categorias';
import { TarjetaCategoria } from '../../core/components/tarjeta-categoria/tarjeta-categoria';
import { RouterLink, RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.html',
  styleUrl: './home.css',
  imports: [TarjetaCategoria, RouterLink, RouterModule],
})
export class Home implements OnInit {
  headerService = inject(HeaderService);
  categoriasService = inject(CategoriasServices);
  cdr = inject(ChangeDetectorRef);

  categorias: Categoria[] = [];

  async ngOnInit() {
    this.headerService.titulo.set('');
    this.categorias = await this.categoriasService.getAll();
    this.cdr.detectChanges();
  }
}