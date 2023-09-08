import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  title = 'verificador-facial'

  constructor(
    
  ) {}

  ngOnInit(): void {
   console.log("Versão 2.0.25")
  }

  
}
