import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';

import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-save-configuration-popup',
  templateUrl: './save-configuration-popup.component.html',
  styleUrls: ['./save-configuration-popup.component.scss']
})
export class SaveConfigurationPopupComponent implements OnInit {
  @ViewChild('errorsDiv') errorsDiv: ElementRef;

  constructor(
    private dialogRef: MatDialogRef<SaveConfigurationPopupComponent>
  ) { }

  ngOnInit(): void {
  }

  cancel(): void {
    this.dialogRef.close();
  }

  submit(name: string): void {
    if (name != "") {
      this.errorsDiv.nativeElement.innerHTML = "";
      this.dialogRef.close({ name: name });
    } else {
      this.errorsDiv.nativeElement.innerHTML = "Missing name field.";
    }
  }
}
