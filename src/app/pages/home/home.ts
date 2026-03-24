import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { HeaderService } from '../../services/header.service';
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
  cdr = inject(ChangeDetectorRef); // 1. Inyectamos el detector de cambios

  categorias: Categoria[] = [];

  async ngOnInit() {
    this.headerService.titulo.set('');

    // 1. Obtenemos la respuesta del servicio
    const res: any = await this.categoriasService.getAll();

    // 2. Verificamos la estructura del JSON
    if (res && Array.isArray(res.categorias)) {
      // Si el JSON es { "categorias": [...] }
      this.categorias = res.categorias;
    } else if (Array.isArray(res)) {
      // Si el JSON es directamente [...]
      this.categorias = res;
    } else {
      console.error('La respuesta no es un array válido', res);
      this.categorias = [];
    }

    // 3. Forzamos el renderizado inmediato
    this.cdr.detectChanges();
  }
}
