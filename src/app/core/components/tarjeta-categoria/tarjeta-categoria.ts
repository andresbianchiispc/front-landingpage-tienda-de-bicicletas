import { Component, Input } from '@angular/core';
import { Categoria } from '../../interfaces/categorias';

@Component({
  selector: 'app-tarjeta-categoria',
  templateUrl: './tarjeta-categoria.html',
  styleUrls: ['./tarjeta-categoria.css'],
  standalone: true,
})
export class TarjetaCategoria {

  @Input({required:true}) categoria!:Categoria;

}