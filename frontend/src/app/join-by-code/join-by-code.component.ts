import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OnlineGamesService } from '../services/online-games.service';

@Component({
  selector: 'app-join-by-code',
  templateUrl: './join-by-code.component.html',
  styleUrls: ['./join-by-code.component.scss']
})
export class JoinByCodeComponent implements OnInit {
  @ViewChild('errorsDiv') errorsDiv: ElementRef;

  constructor(
    private route: ActivatedRoute,
    private onlineGamesService: OnlineGamesService
    ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      let code = params.onlineGameCode;
      if (code && code.length === 6) {
        let onlineGameCodeInput: HTMLInputElement = <HTMLInputElement>document.getElementById("onlineGameCode-input");
        onlineGameCodeInput.value = code;
      }
    });
  }

  go(code: string, name: string) {
    if (code != "") {
      this.errorsDiv.nativeElement.innerHTML = "";
      if (name != "") {
        this.errorsDiv.nativeElement.innerHTML = "";
        this.onlineGamesService.joinByCode(code, name);
      } else {
        this.errorsDiv.nativeElement.innerHTML = "Missing name field.";
      }
    } else {
      this.errorsDiv.nativeElement.innerHTML = "Missing code field.";
    }
  
  }
}
