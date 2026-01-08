import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Vozac } from './vozac/vozac';
import { DRIVERS } from '../db-data';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Vozac, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('motogp');
  prvVozac = DRIVERS[0];
  vtorVozac = DRIVERS[1];
  tretVozac = DRIVERS[2];
  cetvrtVozac = DRIVERS[3];
  soferi = DRIVERS;
  soul(){
        console.log("APP TRIGGER");
    }
}
