import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';

import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-save-game-state-popup',
  templateUrl: './save-game-state-popup.component.html',
  styleUrls: ['./save-game-state-popup.component.scss']
})
export class SaveGameStatePopupComponent implements OnInit {
  @ViewChild('errorsDiv') errorsDiv: ElementRef;

  constructor(
    private dialogRef: MatDialogRef<SaveGameStatePopupComponent>
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
