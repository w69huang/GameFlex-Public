import { Component, OnInit, ViewChild, ElementRef, EventEmitter } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import { Inject } from '@angular/core';
import { DeckService } from 'src/app/services/deck.service';
import { MiddleWare } from 'src/app/services/middleware';
import { UploadCardsPopupComponent } from '../create-deck-popup/upload-cards-popup.component';
import { DeckEditorComponent } from 'src/app/deck-editor/deck-editor.component';
import { $ } from 'protractor';


class deckObject {
  deckName: string;
  deckID: string;
}

@Component({
  selector: 'app-load-cards-popup',
  templateUrl: './load-cards-popup.component.html',
  styleUrls: ['./load-cards-popup.component.scss']
})
export class LoadCardsPopupComponent implements OnInit {
  @ViewChild('errorsDiv') errorsDiv: ElementRef;

  
  public decks: deckObject[] = [];
  private deckNameData: string;
  private selectedDecks: string[] = [];
  public viewDeckBool: boolean = false;
  public selectedDeck: string = null;

  public deckNameEmitter: EventEmitter<string> = new EventEmitter<string>();

  constructor( 
    private dialogRef: MatDialogRef<LoadCardsPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private deckService: DeckService,
    private middleWare: MiddleWare,
    // private dialog: MatDialog,
    ) { 
      const username: string = this.middleWare.getUsername();
      this.deckService.list(username).subscribe((data) => {
        for (var i = 0; i < data.length; i++) {
          var deckData = data[i];
          console.log(deckData);
          this.decks.push({deckID: deckData._id, deckName: deckData.deckName});
          console.log(this.decks);
        }
       });

    }

  ngOnInit(): void {
    // setTimeout(() => {this.deckNameEmitter.emit(this.deckNameData)} ,100); 

  }

  selected(deckName: string) {
    var index = this.selectedDecks.indexOf(deckName);
    if (index != -1) {
      this.selectedDecks.splice(index, 1);
    } else {
      this.selectedDecks.push(deckName)
    }
    console.log(this.selectedDecks);
  }

  removeFromSelecred(deckName: string) {
    const index = this.selectedDecks.indexOf(deckName);
    if (index > -1) {
      this.selectedDecks.splice(index,1);
    }
  }

  cancel(): void {
    this.dialogRef.close({name: null});
  }

  select(): void {
    this.dialogRef.close({ name: this.selectedDecks });
  }

  back():void {
    document.getElementById("def").style.display = "block";
    document.getElementById("loadedCards").style.display = "none";
    this.viewDeckBool = false; 
  }

  viewDeck(deckName: string) {
    document.getElementById("deckDisplayContainer").innerHTML = '';
    this.selectedDeck = deckName;
    this.deckNameEmitter.emit(deckName);
    document.getElementById("def").style.display = "none";
    document.getElementById("loadedCards").style.display = "block";
    this.viewDeckBool = true;
    // $("#loadedCards").show();
    
    // const username: string = this.middleWare.getUsername();

    // let dialogRef = this.dialog.open(UploadCardsPopupComponent, {
    //   height: '70%',
    //   width: '70%',
    //   data: { 
    //     deckNameData: deckName,
    //     userID: username
    //   }
    // });

    // dialogRef.afterClosed().subscribe(deckData => {
    //   const deckName: string = deckData.name;
    //   const username: string = this.middleWare.getUsername();

    //   deckData.files?.forEach(file => {  
    //     this.uploadFile(file, deckName, username);  
    //   });
    // });

   }

}
