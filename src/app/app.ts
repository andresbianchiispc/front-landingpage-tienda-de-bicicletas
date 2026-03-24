import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Tabs } from "./core/components/tabs/tabs";
import { Header } from "./core/components/header/header";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Tabs, Header],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('front-tienda-de-bicicletas');
}
