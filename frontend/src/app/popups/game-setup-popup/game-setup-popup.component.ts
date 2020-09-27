import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';

import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-game-setup-popup',
  templateUrl: './game-setup-popup.component.html',
  styleUrls: ['./game-setup-popup.component.scss']
})
export class GameSetupPopupComponent implements OnInit {
  @ViewChild('errorsDiv') errorsDiv: ElementRef;

  constructor(
    private dialogRef: MatDialogRef<GameSetupPopupComponent>
  ) { }

  ngOnInit(): void {
  }

  cancel(): void {
    this.dialogRef.close();
  }

  submit(name: string, maxPlayers: number, privateGame: boolean, password: string): void {
    if (name != "") {
      this.errorsDiv.nativeElement.innerHTML = "";
      this.dialogRef.close({ name: name, maxPlayers: maxPlayers, privateGame: privateGame, password: password });
    } else {
      this.errorsDiv.nativeElement.innerHTML = "Missing name field.";
    }
  }
}
