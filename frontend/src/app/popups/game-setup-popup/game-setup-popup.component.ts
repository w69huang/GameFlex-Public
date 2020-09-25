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

  submit(roomName: string, maxPlayers: number, privateRoom: boolean, roomPassword: string): void {
    if (roomName != "") {
      this.errorsDiv.nativeElement.innerHTML = "";
      this.dialogRef.close({ roomName: roomName, maxPlayers: maxPlayers, privateRoom: privateRoom, roomPassword: roomPassword });
    } else {
      this.errorsDiv.nativeElement.innerHTML = "Missing name field.";
    }
  }
}
