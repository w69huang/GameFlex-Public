import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';

import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-create-counter-popup',
  templateUrl: './create-counter-popup.component.html',
  styleUrls: ['./create-counter-popup.component.scss']
})
export class CreateCounterPopupComponent implements OnInit {
  @ViewChild('errorsDiv') errorsDiv: ElementRef;

  constructor(
    private dialogRef: MatDialogRef<CreateCounterPopupComponent>
  ) { }

  ngOnInit(): void {
  }

  cancel(): void {
    this.dialogRef.close();
  }

  submit(name: string, defaultValue: string): void {
    if (name != "") {
      if(!isNaN(parseFloat(defaultValue))) {
        this.errorsDiv.nativeElement.innerHTML = "";
        this.dialogRef.close({ name: name, defaultValue: defaultValue });
      } else {
        this.errorsDiv.nativeElement.innerHTML = "Default value is not a number.";
      }
    } else {
      this.errorsDiv.nativeElement.innerHTML = "Missing name field.";
    }
  }
}
