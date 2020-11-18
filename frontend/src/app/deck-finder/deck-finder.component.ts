import { Component, OnInit } from '@angular/core';
import { DeckService } from '../services/deck.service';

@Component({
  selector: 'app-deck-finder',
  templateUrl: './deck-finder.component.html',
  styleUrls: ['./deck-finder.component.scss']
})
export class DeckFinderComponent implements OnInit {

  constructor(private DeckService: DeckService) { }

  createDeck(name: string ) {
    const tempID = 'abcde';
    this.DeckService.createDeck(tempID, name);
   }

  findExistingDeck(name: string) { }

  ngOnInit(): void {
  }

}
