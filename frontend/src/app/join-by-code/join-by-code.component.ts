import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-join-by-code',
  templateUrl: './join-by-code.component.html',
  styleUrls: ['./join-by-code.component.scss']
})
export class JoinByCodeComponent implements OnInit {
  @ViewChild('errorsDiv') errorsDiv: ElementRef;

  constructor() { }

  ngOnInit(): void {
  }

  go(code: string, name: string) {
    if (code != "") {
      this.errorsDiv.nativeElement.innerHTML = "";
    } else {
      this.errorsDiv.nativeElement.innerHTML = "Missing code field.";
    }

    if (name != "") {
      this.errorsDiv.nativeElement.innerHTML = "";
    } else {
      this.errorsDiv.nativeElement.innerHTML = "Missing name field.";
    }
    
    console.log(`Code: ${code} | Name: ${name}`);
  }
}
