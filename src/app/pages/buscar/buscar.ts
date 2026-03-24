import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { HeaderService } from '../../core/services/header.service';
import { CategoriasServices } from '../../core/services/categorias.services';
import { Producto } from '../../core/interfaces/productos';
import { Categoria } from '../../core/interfaces/categorias';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-buscar',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './buscar.html',
  styleUrl: './buscar.css',
})
export class Buscar implements OnInit {
  headerService = inject(HeaderService);
  categoriasService = inject(CategoriasServices);
  cdr = inject(ChangeDetectorRef);

  textoBusqueda: string = '';
  resultados: { producto: Producto; categoria: string }[] = [];
  todosBuscables: { producto: Producto; categoria: string }[] = [];
  buscando: boolean = false;

  async ngOnInit() {
    this.headerService.titulo.set('Buscar');
    const categorias: Categoria[] = await this.categoriasService.getAll();
    // Armamos una lista plana de todos los productos con su categoría
    for (const cat of categorias) {
      for (const prod of cat.productos) {
        this.todosBuscables.push({ producto: prod, categoria: cat.nombre });
      }
    }
    this.cdr.detectChanges();
  }

  buscar() {
    const texto = this.textoBusqueda.trim().toLowerCase();
    if (!texto) {
      this.resultados = [];
      return;
    }
    this.resultados = this.todosBuscables.filter(
      (item) =>
        item.producto.nombre.toLowerCase().includes(texto) ||
        item.categoria.toLowerCase().includes(texto) ||
        item.producto.especificaciones.some((e) => e.toLowerCase().includes(texto))
    );
  }
}