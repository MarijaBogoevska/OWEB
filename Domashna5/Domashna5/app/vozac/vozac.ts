import { Component, input, Input } from '@angular/core';
import { sofer } from '../sofer';

@Component({
  selector: 'app-vozac',
  imports: [],
  templateUrl: './vozac.html',
  styleUrl: './vozac.css',
})
export class Vozac {
    @Input()
    ime:String="";
    @Input()
    motordzija:sofer | undefined;
    @Input()
    indeks:number=0;
    funk(){
        console.log("YOU CLICKED ME!");
    }
}
