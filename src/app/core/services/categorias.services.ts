import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CategoriasServices {
  private http = inject(HttpClient);

  async getAll() {
    try {
      const data = await firstValueFrom(this.http.get('./assets/data/database.json'));
      return data;
    } catch (error) {
      console.error('Error al cargar las categorías:', error);
      return [];
    }
  }

  //obtener el nombre de la categoria por su id
  async getNombreById(id: number) {
    try {
      const data: any = await firstValueFrom(this.http.get('./assets/data/database.json'));
      const categoria = data.categorias.find((cat: any) => cat.id === id);
      return categoria ? categoria.nombre : null;
    } catch (error) {
      console.error('Error al cargar la categoría por ID:', error);
      return null;
    }
  }


}