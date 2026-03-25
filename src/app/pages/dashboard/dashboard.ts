import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HeaderService } from '../../core/services/header.service';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dashboard {
  headerService = inject(HeaderService);
  emailClienteNuevo = '';
  passwordClienteNuevo = '';
  errorCliente = '';
  exitoCliente = '';
  clienteEditandoPassword: string | null = null;
  passwordClienteEdicion = '';
  clienteDetalleAbierto: string | null = null;

  constructor() {
    this.headerService.titulo.set('Dashboard Admin');
  }

  get esAdmin() {
    return this.headerService.rolSesion() === 'admin';
  }

  get publicacionesPendientes() {
    return this.headerService.publicacionesPendientes();
  }

  get publicacionesAprobadas() {
    return this.headerService.publicacionesAprobadas();
  }

  get productosOcultos() {
    return this.headerService.productosOcultos();
  }

  get clientes() {
    return this.headerService.clientes();
  }

  getResumenCliente(email: string) {
    const emailNormalizado = email.trim().toLowerCase();
    const pendientes = this.publicacionesPendientes.filter(
      (item) => item.publicadoPor?.trim().toLowerCase() === emailNormalizado
    ).length;
    const aprobadas = this.publicacionesAprobadas.filter(
      (item) => item.publicadoPor?.trim().toLowerCase() === emailNormalizado
    ).length;

    return {
      pendientes,
      aprobadas,
      total: pendientes + aprobadas,
    };
  }

  getPublicacionesCliente(email: string) {
    const emailNormalizado = email.trim().toLowerCase();
    const pendientes = this.publicacionesPendientes
      .filter((item) => item.publicadoPor?.trim().toLowerCase() === emailNormalizado)
      .map((item) => ({ ...item, estado: 'pendiente' as const }));
    const aprobadas = this.publicacionesAprobadas
      .filter((item) => item.publicadoPor?.trim().toLowerCase() === emailNormalizado)
      .map((item) => ({ ...item, estado: 'aprobada' as const }));

    return [...pendientes, ...aprobadas];
  }

  clienteTienePendientes(email: string) {
    return this.getResumenCliente(email).pendientes > 0;
  }

  clienteTieneDetalleAbierto(email: string) {
    return this.clienteDetalleAbierto === email;
  }

  alternarDetalleCliente(email: string) {
    this.clienteDetalleAbierto = this.clienteDetalleAbierto === email ? null : email;
  }

  getQueryParamsDetalle(tipo: 'pendiente' | 'aprobada') {
    return tipo === 'pendiente' ? { adminVista: 'pendiente' } : {};
  }

  estaEditandoPassword(email: string) {
    return this.clienteEditandoPassword === email;
  }

  iniciarEdicionPassword(email: string) {
    this.errorCliente = '';
    this.exitoCliente = '';
    this.clienteEditandoPassword = email;
    this.passwordClienteEdicion = '';
  }

  cancelarEdicionPassword() {
    this.clienteEditandoPassword = null;
    this.passwordClienteEdicion = '';
  }

  guardarPasswordCliente(email: string) {
    if (!this.esAdmin) return;

    this.errorCliente = '';
    this.exitoCliente = '';

    const resultado = this.headerService.actualizarPasswordCliente(
      email,
      this.passwordClienteEdicion
    );

    if (!resultado.ok) {
      this.errorCliente = resultado.mensaje || 'No se pudo actualizar la contraseña.';
      return;
    }

    this.exitoCliente = `Contraseña actualizada para ${email}.`;
    this.cancelarEdicionPassword();
  }

  crearCliente() {
    if (!this.esAdmin) return;

    this.errorCliente = '';
    this.exitoCliente = '';

    const resultado = this.headerService.crearClientePublicador(
      this.emailClienteNuevo,
      this.passwordClienteNuevo
    );

    if (!resultado.ok) {
      this.errorCliente = resultado.mensaje || 'No se pudo crear el cliente.';
      return;
    }

    this.exitoCliente = 'Cliente habilitado para iniciar sesión y publicar.';
    this.emailClienteNuevo = '';
    this.passwordClienteNuevo = '';
  }

  eliminarCliente(email: string) {
    if (!this.esAdmin) return;

    if (this.clienteTienePendientes(email)) {
      this.errorCliente =
        'No podés eliminar un cliente que todavía tiene publicaciones pendientes.';
      this.exitoCliente = '';
      return;
    }

    const confirmar = window.confirm(`¿Querés quitar el acceso del cliente ${email}?`);
    if (!confirmar) return;

    const resultado = this.headerService.eliminarClientePublicador(email);
    this.errorCliente = resultado.ok ? '' : resultado.mensaje || 'No se pudo eliminar el cliente.';
    this.exitoCliente = resultado.ok ? 'Cliente removido correctamente.' : '';
    if (resultado.ok && this.clienteEditandoPassword === email) {
      this.cancelarEdicionPassword();
    }
  }

  aprobarPublicacion(productoId: number) {
    if (!this.esAdmin) return;
    this.headerService.aprobarPublicacion(productoId);
  }

  rechazarPublicacion(productoId: number) {
    if (!this.esAdmin) return;
    this.headerService.rechazarPublicacion(productoId);
  }

  quitarPublicacionAprobada(productoId: number) {
    if (!this.esAdmin) return;
    const producto = this.publicacionesAprobadas.find((item) => item.id === productoId);
    const confirmar = window.confirm(
      `¿Querés quitar del catálogo a "${producto?.nombre || 'este producto'}"?`
    );
    if (!confirmar) return;
    this.headerService.quitarPublicacionAprobada(productoId);
  }

  restaurarProducto(productoId: number) {
    if (!this.esAdmin) return;
    const producto = this.productosOcultos.find((item) => item.id === productoId);
    const confirmar = window.confirm(
      `¿Querés restaurar "${producto?.nombre || 'este producto'}" al catálogo?`
    );
    if (!confirmar) return;
    this.headerService.restaurarProducto(productoId);
  }
}
