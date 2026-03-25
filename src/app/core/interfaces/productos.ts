export interface Producto {
  id: number;
  nombre: string;
  precio: number;
  especificaciones: string[];
  fotoUrl: string;
  categoriaId?: number;
  publicadoPor?: string;
  esPublicacionUsuario?: boolean;
}
