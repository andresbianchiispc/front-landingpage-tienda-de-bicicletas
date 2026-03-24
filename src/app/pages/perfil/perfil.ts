import { Component, inject, OnInit } from '@angular/core';
import { HeaderService } from '../../core/services/header.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css',
})
export class Perfil implements OnInit {
  headerService = inject(HeaderService);

  nombre = 'Andrés Bianchi';
  email = 'andres@velocitybikes.com';
  telefono = '+54 351 000-0000';
  editando = false;
  guardado = false;

  // Copia temporal para editar
  nombreTemp = '';
  emailTemp = '';
  telefonoTemp = '';

  ngOnInit() {
    this.headerService.titulo.set('Mi Perfil');
  }

  iniciarEdicion() {
    this.nombreTemp = this.nombre;
    this.emailTemp = this.email;
    this.telefonoTemp = this.telefono;
    this.editando = true;
  }

  guardar() {
    this.nombre = this.nombreTemp;
    this.email = this.emailTemp;
    this.telefono = this.telefonoTemp;
    this.editando = false;
    this.guardado = true;
    setTimeout(() => (this.guardado = false), 2000);
  }

  cancelar() {
    this.editando = false;
  }
}