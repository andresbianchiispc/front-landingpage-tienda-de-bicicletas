import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { HeaderService } from '../../core/services/header.service';
import { CategoriasServices } from '../../core/services/categorias.services';
import { ProductosServices } from '../../core/services/productos.services';
import { Categoria } from '../../core/interfaces/categorias';
import { Producto } from '../../core/interfaces/productos';
import { RouterLink, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.html',
  styleUrl: './home.css',
  imports: [RouterLink, RouterModule, CommonModule],
})
export class Home implements OnInit {
  headerService = inject(HeaderService);
  categoriasService = inject(CategoriasServices);
  productosService = inject(ProductosServices);
  cdr = inject(ChangeDetectorRef);

  categorias: Categoria[] = [];
  todosLosProductos: Producto[] = [];
  productosFiltrados: Producto[] = [];
  categoriaSeleccionada: number | null = null;
  menuFiltrosAbierto: boolean = false;

  async ngOnInit() {
    this.headerService.titulo.set('');
    this.categorias = await this.categoriasService.getAll();
    await this.cargarTodosLosProductos();
    this.cdr.detectChanges();
  }

  get nombreCategoriaActual(): string {
    if (this.categoriaSeleccionada === null) return 'Todo el Catálogo';
    const cat = this.categorias.find(c => c.id === this.categoriaSeleccionada);
    return cat ? cat.nombre : 'Filtros';
  }

  toggleMenuFiltros() {
    this.menuFiltrosAbierto = !this.menuFiltrosAbierto;
  }

  async cargarTodosLosProductos() {
    let todos: Producto[] = [];
    for (const cat of this.categorias) {
      const prods = await this.productosService.getByCategoria(cat.id);
      todos = [...todos, ...prods];
    }
    // Opcional: mezclar o alinear productos
    this.todosLosProductos = todos;
    this.productosFiltrados = todos;
  }

  filtrarPorCategoria(idCategoria: number | null, event?: Event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.categoriaSeleccionada = idCategoria;
    this.menuFiltrosAbierto = false; // Cierra el menú en móvil al seleccionar
    
    if (idCategoria === null) {
      this.productosFiltrados = this.todosLosProductos;
    } else {
      this.productosFiltrados = this.todosLosProductos.filter(
        (p) => p.categoriaId === idCategoria || this.categorias.find(c => c.id === idCategoria)?.productos?.some((cp: any) => cp.id === p.id)
      );
      this.productosService.getByCategoria(idCategoria).then((prods) => {
         this.productosFiltrados = prods;
         this.cdr.detectChanges();
      });
    }
  }

  scrollGaleria(wrapper: HTMLElement, direccion: number, event: Event) {
    event.preventDefault();
    event.stopPropagation();
    const track = wrapper.querySelector('.carousel-track') as HTMLElement;
    if (track) {
      track.scrollBy({ left: direccion * track.clientWidth, behavior: 'smooth' });
    }
  }
}