import { Component, inject } from '@angular/core';
import { HeaderService } from '../../../services/header.service';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-header',
  imports: [RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  headerService = inject(HeaderService);
}
