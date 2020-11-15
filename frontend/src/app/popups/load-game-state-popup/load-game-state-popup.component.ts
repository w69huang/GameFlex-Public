import { Component, OnInit } from '@angular/core';

import { MatDialogRef } from '@angular/material/dialog';

// -Present user with popup to load data from cache or clear cache in the game setup and when they actually get into a game
// -Related, users should be able to load a saved game state from the game setup

@Component({
  selector: 'app-load-game-state-popup',
  templateUrl: './load-game-state-popup.component.html',
  styleUrls: ['./load-game-state-popup.component.scss']
})
export class LoadGameStatePopupComponent implements OnInit {
  constructor(
    private dialogRef: MatDialogRef<LoadGameStatePopupComponent>
  ) { }

  ngOnInit(): void {
  }

  no(): void {
    this.dialogRef.close({ loadFromCache: false });
  }

  yes(): void {
    this.dialogRef.close({ loadFromCache: true });
  }

}
