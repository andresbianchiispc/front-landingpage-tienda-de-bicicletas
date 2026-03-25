import { Component, inject } from '@angular/core';
import { HeaderService } from '../../services/header.service';
import { Router, RouterLink } from "@angular/router";

@Component({
  selector: 'app-header',
  imports: [RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  headerService = inject(HeaderService);
  private router = inject(Router);

  get haySesion() {
    return this.headerService.usuarioLogueado();
  }

  get emailSesion() {
    return this.headerService.emailSesion();
  }

  get etiquetaSesion() {
    return this.headerService.rolSesion() === 'admin' ? 'Administrador' : 'Cliente publicador';
  }

  cerrarSesion() {
    this.headerService.cerrarSesion();
    void this.router.navigate(['/perfil']);
  }
}
