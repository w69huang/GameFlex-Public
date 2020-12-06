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
  private deckList: string[] = new Array<string>();
  private deckList$: Subject<string[]> = new Subject<string[]>();

  constructor(private httpClient: HttpClient, private webService: WebService) { }

  public createDeck(userID: string, deckName: string) { 
    console.log('Deck creation in progress...');
    this.webService.post('new-deck', {userID: userID, deckName: deckName}, true).subscribe(() => {

    });
  }

  public findExistingDeck(userID: string) { 
    //this.webService.get()
  }

  public list(userID: string): any {
    return this.webService.post('get', {userID: userID} , true);
    //return this.fileList$;
  }

}