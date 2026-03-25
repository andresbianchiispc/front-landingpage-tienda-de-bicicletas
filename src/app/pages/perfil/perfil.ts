import { Component, inject, OnInit } from '@angular/core';
import { HeaderService } from '../../core/services/header.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css',
})
export class Perfil implements OnInit {
  headerService = inject(HeaderService);
  private router = inject(Router);

  usuarioLogin = '';
  passwordLogin = '';
  errorLogin = '';

  ngOnInit() {
    this.headerService.titulo.set('Mi Perfil');
  }

  iniciarSesion() {
    this.errorLogin = '';

    if (!this.usuarioLogin.trim() || !this.passwordLogin.trim()) {
      this.errorLogin = 'Completá usuario y contraseña para iniciar sesión';
      return;
    }

    const resultado = this.headerService.iniciarSesion(
      this.usuarioLogin.trim(),
      this.passwordLogin.trim()
    );

    if (!resultado.ok) {
      this.errorLogin = resultado.mensaje || 'No se pudo iniciar sesión';
      return;
    }

    this.passwordLogin = '';

    if (resultado.rol === 'admin') {
      void this.router.navigate(['/dashboard']);
      return;
    }

    void this.router.navigate(['/publicar']);
  }

  cerrarSesion() {
    this.headerService.cerrarSesion();
    this.usuarioLogin = '';
    this.passwordLogin = '';
  }

}

