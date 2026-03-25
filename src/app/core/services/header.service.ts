import { Injectable, signal } from '@angular/core';
import { Producto } from '../interfaces/productos';

export interface ItemCarrito {
  producto: Producto;
  cantidad: number;
}

type RolSesion = 'usuario' | 'admin' | null;

interface PublicacionesDb {
  pendientes: Producto[];
  aprobadas: Producto[];
}

interface ResultadoSesion {
  ok: boolean;
  rol?: Exclude<RolSesion, null>;
  mensaje?: string;
}

interface ResultadoGestionCliente {
  ok: boolean;
  mensaje?: string;
}

interface CredencialAcceso {
  usuario: string;
  email: string;
  password: string;
  rol: Exclude<RolSesion, null>;
}

@Injectable({
  providedIn: 'root',
})
export class HeaderService {
  private readonly DB_KEY = 'publicaciones-db-json';
  private readonly JSON_SEED_URL = '/assets/data/publicaciones.json';
  private readonly SESION_KEY = 'sesion-actual-json';
  private readonly PRODUCTOS_EDITADOS_KEY = 'productos-editados-json';
  private readonly PRODUCTOS_OCULTOS_KEY = 'productos-ocultos-json';
  private readonly CLIENTES_KEY = 'clientes-publicadores-json';
  private readonly ADMIN_CREDENCIAL: CredencialAcceso = {
    usuario: 'admin',
    email: 'admin@tiendabicis.com',
    password: 'admin123',
    rol: 'admin',
  };
  private readonly CLIENTES_BASE: CredencialAcceso[] = [
    {
      usuario: 'cliente',
      email: 'cliente@tiendabicis.com',
      password: 'client123',
      rol: 'usuario',
    },
  ];

  titulo = signal('Tienda de Bicicletas');
  extendido = signal(true);
  usuarioLogueado = signal(false);
  emailSesion = signal('');
  rolSesion = signal<RolSesion>(null);

  // --- Carrito ---
  private _items = signal<ItemCarrito[]>([]);
  items = this._items.asReadonly();
  private _publicacionesPendientes = signal<Producto[]>([]);
  publicacionesPendientes = this._publicacionesPendientes.asReadonly();
  private _publicacionesAprobadas = signal<Producto[]>([]);
  publicacionesAprobadas = this._publicacionesAprobadas.asReadonly();
  private _productosEditados = signal<Producto[]>([]);
  productosEditados = this._productosEditados.asReadonly();
  private _productosOcultos = signal<Producto[]>([]);
  productosOcultos = this._productosOcultos.asReadonly();
  private _clientes = signal<CredencialAcceso[]>([]);
  clientes = this._clientes.asReadonly();

  constructor() {
    this.cargarClientes();
    void this.cargarDbPublicaciones();
    this.cargarSesion();
    this.cargarProductosEditados();
    this.cargarProductosOcultos();
  }

  get cantidadTotal(): number {
    return this._items().reduce((acc, i) => acc + i.cantidad, 0);
  }

  get precioTotal(): number {
    return this._items().reduce((acc, i) => acc + i.producto.precio * i.cantidad, 0);
  }

  agregarAlCarrito(producto: Producto) {
    const actuales = this._items();
    const existe = actuales.find((i) => i.producto.id === producto.id);
    if (existe) {
      this._items.set(
        actuales.map((i) =>
          i.producto.id === producto.id ? { ...i, cantidad: i.cantidad + 1 } : i
        )
      );
    } else {
      this._items.set([...actuales, { producto, cantidad: 1 }]);
    }
  }

  quitarDelCarrito(productoId: number) {
    const actuales = this._items();
    const item = actuales.find((i) => i.producto.id === productoId);
    if (!item) return;
    if (item.cantidad > 1) {
      this._items.set(
        actuales.map((i) =>
          i.producto.id === productoId ? { ...i, cantidad: i.cantidad - 1 } : i
        )
      );
    } else {
      this._items.set(actuales.filter((i) => i.producto.id !== productoId));
    }
  }

  eliminarDelCarrito(productoId: number) {
    this._items.set(this._items().filter((i) => i.producto.id !== productoId));
  }

  vaciarCarrito() {
    this._items.set([]);
  }

  publicarProductoUsuario(producto: Producto, categoriaId: number) {
    const productoConMeta: Producto = {
      ...producto,
      categoriaId,
      publicadoPor: this.emailSesion(),
      esPublicacionUsuario: true,
    };

    this._publicacionesPendientes.update((actuales) => [productoConMeta, ...actuales]);
    this.guardarDbPublicaciones();
  }

  aprobarPublicacion(productoId: number) {
    const pendientes = this._publicacionesPendientes();
    const publicacion = pendientes.find((item) => Number(item.id) === productoId);
    if (!publicacion) return;

    this._publicacionesPendientes.set(
      pendientes.filter((item) => Number(item.id) !== productoId)
    );
    this._publicacionesAprobadas.update((actuales) => [publicacion, ...actuales]);
    this.guardarDbPublicaciones();
  }

  rechazarPublicacion(productoId: number) {
    this._publicacionesPendientes.update((pendientes) =>
      pendientes.filter((item) => Number(item.id) !== productoId)
    );
    this.guardarDbPublicaciones();
  }

  quitarPublicacionAprobada(productoId: number) {
    this._publicacionesAprobadas.update((aprobadas) =>
      aprobadas.filter((item) => Number(item.id) !== productoId)
    );
    this.guardarDbPublicaciones();
  }

  guardarEdicionProducto(producto: Producto) {
    this._productosEditados.update((actuales) => {
      const existe = actuales.find((item) => Number(item.id) === Number(producto.id));
      if (existe) {
        return actuales.map((item) =>
          Number(item.id) === Number(producto.id) ? { ...item, ...producto } : item
        );
      }

      return [...actuales, producto];
    });

    this.guardarProductosEditados();
  }

  obtenerProductoEditado(productoId: number) {
    return this._productosEditados().find((item) => Number(item.id) === Number(productoId));
  }

  ocultarProducto(producto: Producto) {
    this._productosOcultos.update((actuales) => {
      const existe = actuales.find((item) => Number(item.id) === Number(producto.id));
      if (existe) {
        return actuales;
      }

      return [...actuales, producto];
    });

    this.guardarProductosOcultos();
  }

  restaurarProducto(productoId: number) {
    this._productosOcultos.update((actuales) =>
      actuales.filter((item) => Number(item.id) !== Number(productoId))
    );

    this.guardarProductosOcultos();
  }

  esProductoOculto(productoId: number) {
    return this._productosOcultos().some((item) => Number(item.id) === Number(productoId));
  }

  crearClientePublicador(email: string, password: string): ResultadoGestionCliente {
    const emailNormalizado = this.normalizarIdentificador(email);
    const passwordNormalizado = password.trim();

    if (!this.esEmailValido(emailNormalizado)) {
      return { ok: false, mensaje: 'Ingresá un mail válido para el cliente.' };
    }

    if (passwordNormalizado.length < 4) {
      return { ok: false, mensaje: 'La contraseña debe tener al menos 4 caracteres.' };
    }

    const credencialExistente = this.obtenerCredencialPorIdentificador(emailNormalizado);
    if (credencialExistente) {
      return { ok: false, mensaje: 'Ya existe un usuario con ese mail.' };
    }

    this._clientes.update((actuales) => [
      ...actuales,
      {
        usuario: emailNormalizado,
        email: emailNormalizado,
        password: passwordNormalizado,
        rol: 'usuario',
      },
    ]);
    this.guardarClientes();

    return { ok: true };
  }

  eliminarClientePublicador(email: string): ResultadoGestionCliente {
    const emailNormalizado = this.normalizarIdentificador(email);
    const existe = this._clientes().some((item) => item.email === emailNormalizado);

    if (!existe) {
      return { ok: false, mensaje: 'No se encontró un cliente con ese mail.' };
    }

    const tienePendientes = this._publicacionesPendientes().some(
      (item) => this.normalizarIdentificador(item.publicadoPor || '') === emailNormalizado
    );

    if (tienePendientes) {
      return {
        ok: false,
        mensaje: 'No podés eliminar este cliente porque todavía tiene publicaciones pendientes.',
      };
    }

    this._clientes.update((actuales) =>
      actuales.filter((item) => item.email !== emailNormalizado)
    );
    this.guardarClientes();

    return { ok: true };
  }

  actualizarPasswordCliente(email: string, password: string): ResultadoGestionCliente {
    const emailNormalizado = this.normalizarIdentificador(email);
    const passwordNormalizado = password.trim();

    if (passwordNormalizado.length < 4) {
      return { ok: false, mensaje: 'La contraseña debe tener al menos 4 caracteres.' };
    }

    const existe = this._clientes().some((item) => item.email === emailNormalizado);
    if (!existe) {
      return { ok: false, mensaje: 'No se encontró un cliente con ese mail.' };
    }

    this._clientes.update((actuales) =>
      actuales.map((item) =>
        item.email === emailNormalizado ? { ...item, password: passwordNormalizado } : item
      )
    );
    this.guardarClientes();

    return { ok: true };
  }

  iniciarSesion(usuario: string, password: string): ResultadoSesion {
    const usuarioNormalizado = this.normalizarIdentificador(usuario);
    const passwordNormalizado = password.trim();

    const credencial = this.obtenerCredencialesAcceso().find(
      (item) =>
        (item.usuario === usuarioNormalizado || item.email === usuarioNormalizado) &&
        item.password === passwordNormalizado
    );

    if (credencial) {
      this.emailSesion.set(credencial.email);
      this.usuarioLogueado.set(true);
      this.rolSesion.set(credencial.rol);
      this.guardarSesion();
      return { ok: true, rol: credencial.rol };
    }

    this.cerrarSesion();
    return {
      ok: false,
      mensaje: 'Credenciales inválidas. Verificá tus datos e intentá nuevamente.',
    };
  }

  cerrarSesion() {
    this.emailSesion.set('');
    this.usuarioLogueado.set(false);
    this.rolSesion.set(null);
    this.limpiarSesion();
  }

  private async cargarDbPublicaciones() {
    if (typeof localStorage === 'undefined') return;

    const jsonDb = localStorage.getItem(this.DB_KEY);
    if (jsonDb) {
      try {
        const db: PublicacionesDb = JSON.parse(jsonDb);
        const pendientes = this.normalizarPublicaciones(db.pendientes || []);
        const aprobadas = this.normalizarPublicaciones(db.aprobadas || []);

        this._publicacionesPendientes.set(pendientes);
        this._publicacionesAprobadas.set(aprobadas);

        if (pendientes.length > 0 || aprobadas.length > 0) {
          return;
        }
      } catch {
        this._publicacionesPendientes.set([]);
        this._publicacionesAprobadas.set([]);
      }
    }

    try {
      const res = await fetch(this.JSON_SEED_URL);
      if (!res.ok) {
        this._publicacionesPendientes.set([]);
        this._publicacionesAprobadas.set([]);
        return;
      }

      const db: PublicacionesDb = await res.json();
      this._publicacionesPendientes.set(this.normalizarPublicaciones(db.pendientes || []));
      this._publicacionesAprobadas.set(this.normalizarPublicaciones(db.aprobadas || []));
      this.guardarDbPublicaciones();
    } catch {
      this._publicacionesPendientes.set([]);
      this._publicacionesAprobadas.set([]);
    }
  }

  private guardarDbPublicaciones() {
    if (typeof localStorage === 'undefined') return;

    const db: PublicacionesDb = {
      pendientes: this._publicacionesPendientes(),
      aprobadas: this._publicacionesAprobadas(),
    };

    localStorage.setItem(this.DB_KEY, JSON.stringify(db));
  }

  private cargarSesion() {
    if (typeof localStorage === 'undefined') return;

    const sesionJson = localStorage.getItem(this.SESION_KEY);
    if (!sesionJson) return;

    try {
      const sesion = JSON.parse(sesionJson) as {
        usuario: string;
        rol: Exclude<RolSesion, null>;
      };

      if (!sesion.usuario || !sesion.rol) {
        this.limpiarSesion();
        return;
      }

      const credencial = this.obtenerCredencialPorIdentificador(sesion.usuario);
      if (credencial && credencial.rol === sesion.rol) {
        this.emailSesion.set(credencial.email);
        this.rolSesion.set(credencial.rol);
        this.usuarioLogueado.set(true);
        this.guardarSesion();
        return;
      }

      this.emailSesion.set(sesion.usuario);
      this.rolSesion.set(sesion.rol);
      this.usuarioLogueado.set(true);
    } catch {
      this.limpiarSesion();
    }
  }

  private guardarSesion() {
    if (typeof localStorage === 'undefined') return;

    if (!this.usuarioLogueado() || !this.emailSesion() || !this.rolSesion()) {
      this.limpiarSesion();
      return;
    }

    localStorage.setItem(
      this.SESION_KEY,
      JSON.stringify({
        usuario: this.emailSesion(),
        rol: this.rolSesion(),
      })
    );
  }

  private limpiarSesion() {
    if (typeof localStorage === 'undefined') return;
    localStorage.removeItem(this.SESION_KEY);
  }

  private cargarProductosEditados() {
    if (typeof localStorage === 'undefined') return;

    const productosJson = localStorage.getItem(this.PRODUCTOS_EDITADOS_KEY);
    if (!productosJson) return;

    try {
      const productos = JSON.parse(productosJson) as Producto[];
      this._productosEditados.set(Array.isArray(productos) ? productos : []);
    } catch {
      this._productosEditados.set([]);
    }
  }

  private guardarProductosEditados() {
    if (typeof localStorage === 'undefined') return;

    localStorage.setItem(
      this.PRODUCTOS_EDITADOS_KEY,
      JSON.stringify(this._productosEditados())
    );
  }

  private cargarProductosOcultos() {
    if (typeof localStorage === 'undefined') return;

    const productosJson = localStorage.getItem(this.PRODUCTOS_OCULTOS_KEY);
    if (!productosJson) return;

    try {
      const productos = JSON.parse(productosJson) as Producto[];
      this._productosOcultos.set(Array.isArray(productos) ? productos : []);
    } catch {
      this._productosOcultos.set([]);
    }
  }

  private guardarProductosOcultos() {
    if (typeof localStorage === 'undefined') return;

    localStorage.setItem(
      this.PRODUCTOS_OCULTOS_KEY,
      JSON.stringify(this._productosOcultos())
    );
  }

  private normalizarIdentificador(valor: string) {
    return valor.trim().toLowerCase();
  }

  private obtenerCredencialPorIdentificador(identificador: string) {
    const valorNormalizado = this.normalizarIdentificador(identificador);
    return this.obtenerCredencialesAcceso().find(
      (item) => item.usuario === valorNormalizado || item.email === valorNormalizado
    );
  }

  private obtenerCredencialesAcceso() {
    return [this.ADMIN_CREDENCIAL, ...this._clientes()];
  }

  private esEmailValido(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  private cargarClientes() {
    if (typeof localStorage === 'undefined') return;

    const clientesJson = localStorage.getItem(this.CLIENTES_KEY);
    if (!clientesJson) {
      this._clientes.set(this.CLIENTES_BASE);
      this.guardarClientes();
      return;
    }

    try {
      const clientes = JSON.parse(clientesJson) as CredencialAcceso[];
      const clientesNormalizados = Array.isArray(clientes)
        ? clientes
            .filter((item) => item?.rol === 'usuario' && !!item.email && !!item.password)
            .map((item) => ({
              usuario: item.usuario ? this.normalizarIdentificador(item.usuario) : this.normalizarIdentificador(item.email),
              email: this.normalizarIdentificador(item.email),
              password: item.password,
              rol: 'usuario' as const,
            }))
        : [];

      this._clientes.set(clientesNormalizados.length > 0 ? clientesNormalizados : this.CLIENTES_BASE);
      this.guardarClientes();
    } catch {
      this._clientes.set(this.CLIENTES_BASE);
      this.guardarClientes();
    }
  }

  private guardarClientes() {
    if (typeof localStorage === 'undefined') return;

    localStorage.setItem(this.CLIENTES_KEY, JSON.stringify(this._clientes()));
  }

  private normalizarPublicaciones(publicaciones: Producto[]) {
    return publicaciones.map((producto) => {
      const credencial = producto.publicadoPor
        ? this.obtenerCredencialPorIdentificador(producto.publicadoPor)
        : undefined;

      return credencial
        ? {
            ...producto,
            publicadoPor: credencial.email,
          }
        : producto;
    });
  }
}