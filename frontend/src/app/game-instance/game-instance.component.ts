import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-game-instance',
  templateUrl: './game-instance.component.html',
  styleUrls: ['./game-instance.component.scss']
})
export class GameInstanceComponent implements OnInit {

  public mainHostID: string;
  public onlineGameID: string;

  constructor(
    private route: ActivatedRoute,
    ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.mainHostID = params['host'];
      this.onlineGameID = params['onlineGameID'];
    });
  }

}
