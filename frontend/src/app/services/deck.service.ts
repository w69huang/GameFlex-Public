import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpErrorResponse, HttpEventType } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { BehaviorSubject, Subject, Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { WebService } from '../services/web.service';

@Injectable({
  providedIn: 'root'
})
export class DeckService {

  constructor(private httpClient: HttpClient, private webService: WebService) { }

  public createDeck(userID: string, deckName: string) { 
    console.log('Deck creation in progress');
    this.webService.post('new-deck', {userID: userID, deckName: deckName}).subscribe(() => {

    });
  }

  public findExistingDeck(deckID: string) { 

  }
}
