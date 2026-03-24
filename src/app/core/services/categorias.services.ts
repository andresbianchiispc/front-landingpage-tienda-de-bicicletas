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
}