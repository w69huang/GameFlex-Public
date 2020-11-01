import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import OnlineGame from '../models/onlineGame';
import PlayerData from '../models/playerData';

@Component({
  selector: 'app-game-instance',
  templateUrl: './game-instance.component.html',
  styleUrls: ['./game-instance.component.scss']
})
export class GameInstanceComponent implements OnInit {

  public mainHostID: string;
  public onlineGameID: string;
  public onlineGame: OnlineGame;
  public playerData: PlayerData[];
  public amHost: boolean = false;

  constructor(
    private route: ActivatedRoute,
    ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.mainHostID = params['host'];
      this.onlineGameID = params['onlineGameID'];
    });
  }

  receiveOnlineGameData(onlineGame: OnlineGame) {
    this.onlineGame = onlineGame;
  }

  receivePlayerData(playerData: PlayerData[]) {
    this.playerData = playerData;
  }

  receiveAmHost(amHost: boolean) {
    this.amHost = amHost;
  }
}
