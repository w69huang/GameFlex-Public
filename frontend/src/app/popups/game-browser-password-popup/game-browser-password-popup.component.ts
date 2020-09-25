import { Component, OnInit } from '@angular/core';

import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-popup',
  templateUrl: './game-browser-password-popup.component.html',
  styleUrls: ['./game-browser-password-popup.component.scss']
})
export class GameBrowserPopupComponent implements OnInit {

  constructor(
    private dialogRef: MatDialogRef<GameBrowserPopupComponent>
  ) { }

  ngOnInit(): void {
  }

  cancel(): void {
    this.dialogRef.close();
  }

  submit(password: string): void {
    this.dialogRef.close(password);
  }
}
