import { Component, inject } from '@angular/core';
import { HeaderService } from '../../../services/header.service';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  headerService = inject(HeaderService);
}
