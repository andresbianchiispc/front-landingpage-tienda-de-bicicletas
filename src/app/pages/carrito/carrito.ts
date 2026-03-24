import { Component, inject, OnInit } from '@angular/core';
import { HeaderService, ItemCarrito } from '../../core/services/header.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './carrito.html',
  styleUrl: './carrito.css',
})
export class Carrito implements OnInit {
  headerService = inject(HeaderService);

  // Control del modal
  mostrarFormulario = false;

  // Datos del formulario
  nombre = '';
  telefono = '';
  direccion = '';
  notas = '';

  // Errores de validación
  errores: { nombre?: string; telefono?: string; direccion?: string } = {};

  ngOnInit() {
    // Seteamos el título del header al entrar al componente
    this.headerService.titulo.set('Mi Carrito');
  }

  // Getters para acceder fácilmente a los datos del Signal del Service
  get items() {
    return this.headerService.items();
  }
  get total() {
    return this.headerService.precioTotal;
  }
  get cantidad() {
    return this.headerService.cantidadTotal;
  }

  // Funciones de gestión del carrito
  sumar(item: ItemCarrito) {
    this.headerService.agregarAlCarrito(item.producto);
  }

  restar(item: ItemCarrito) {
    this.headerService.quitarDelCarrito(item.producto.id);
  }

  eliminar(item: ItemCarrito) {
    this.headerService.eliminarDelCarrito(item.producto.id);
  }

  vaciar() {
    this.headerService.vaciarCarrito();
  }

  // Gestión del Formulario/Modal
  abrirFormulario() {
    this.mostrarFormulario = true;
    this.errores = {}; // Limpiamos errores previos al abrir
  }

  cerrarFormulario() {
    this.mostrarFormulario = false;
    this.vaciarFormulario();
  }

  private vaciarFormulario() {
    this.nombre = '';
    this.telefono = '';
    this.direccion = '';
    this.notas = '';
    this.errores = {};
  }

  validar(): boolean {
    this.errores = {};
    if (!this.nombre.trim()) this.errores.nombre = 'El nombre es obligatorio';
    if (!this.telefono.trim()) this.errores.telefono = 'El teléfono es obligatorio';
    if (!this.direccion.trim()) this.errores.direccion = 'La dirección es obligatoria';

    return Object.keys(this.errores).length === 0;
  }
  enviarPedido() {
    if (!this.validar()) return;

    const mensaje = `
NUEVO PEDIDO - VelocityBikes
--------------------------------------
DATOS DEL CLIENTE
Nombre: ${this.nombre.trim()}
Teléfono: ${this.telefono.trim()}
Dirección: ${this.direccion.trim()}
${this.notas.trim() ? `Notas: ${this.notas.trim()}` : ''}

PRODUCTOS
${this.items
  .map((item) => {
    const subtotal = item.producto.precio * item.cantidad;
    return `- ${item.producto.nombre} (x${item.cantidad}) = $${subtotal.toLocaleString('es-AR')}`;
  })
  .join('\n')}

--------------------------------------
TOTAL: $${this.total.toLocaleString('es-AR')}
--------------------------------------

Mensaje generado desde la tienda online
`;

    const numero = '5493512740586';

    const url = `https://api.whatsapp.com/send?phone=${numero}&text=${encodeURIComponent(mensaje)}`;

    window.open(url, '_blank');

    this.headerService.vaciarCarrito();
    this.mostrarFormulario = false;
    this.vaciarFormulario();
  }
}
