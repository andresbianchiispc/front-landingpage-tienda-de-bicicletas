import { Routes } from '@angular/router';
import { Carrito } from './pages/carrito/carrito';
import { Categoria } from './pages/categoria/categoria';
import { Perfil } from './pages/perfil/perfil';
import { Buscar } from './pages/buscar/buscar';
import { Articulo } from './pages/articulo/articulo';
import { Home } from './pages/home/home';
import { Dashboard } from './pages/dashboard/dashboard';
import { Publicar } from './pages/publicar/publicar';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'carrito', component: Carrito },
  { path: 'categoria/:id', component: Categoria },
  { path: 'perfil', component: Perfil },
  { path: 'dashboard', component: Dashboard },
  { path: 'publicar', component: Publicar },
  { path: 'buscar', component: Buscar },
  { path: 'articulo/:id', component: Articulo },
  { path: '**', redirectTo: '', pathMatch: 'full' },
];
