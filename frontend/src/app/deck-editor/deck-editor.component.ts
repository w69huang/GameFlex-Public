import { Component, OnInit, ViewChild, ElementRef  } from '@angular/core';
import { HttpEventType, HttpErrorResponse } from '@angular/common/http';
import { of } from 'rxjs';  
import { catchError, map } from 'rxjs/operators';  
import { FileService } from '../services/file.service';
import { DeckService } from '../services/deck.service';
import { MatDialog } from '@angular/material/dialog';
import { CreateDeckPopupComponent } from '../popups/create-deck-popup/create-deck-popup.component';
import { MiddleWare } from '../services/middleware';

@Component({
  selector: 'app-deck-editor',
  templateUrl: './deck-editor.component.html',
  styleUrls: ['./deck-editor.component.scss']
})
export class DeckEditorComponent implements OnInit {
  @ViewChild("fileUpload", {static: false}) fileUpload: ElementRef; files = []

  constructor(private deckService: DeckService, private fileService: FileService, private dialog: MatDialog, private middleWare: MiddleWare) { }

  ngOnInit(): void {}

  createDeck() {
    //  const tempID = 'abcde';
    //  this.deckService.createDeck(tempID, name);

    let dialogRef = this.dialog.open(CreateDeckPopupComponent, {
      height: '200px',
      width: '400px',
    });

    dialogRef.afterClosed().subscribe(deckData => {
      const deckName: string = deckData.name;
      const username: string = this.middleWare.getUsername();

      deckData.files?.forEach(file => {  
        this.uploadFile(file);  
      });
    });
   }

  findExistingDeck(name: string) { }

  // TODO: Take the deckName and pass it into the service call to the backend when we upload a file
  // That way, we can associate the file with a name on the backend
  // --> Also, we'll probably want to pass in the player's username
  uploadFile(file) {  
    const formData = new FormData();  
    formData.append('file', file.data);

    //Using the "new" fileService
    //this.fileService.upload(file.data.name, formData)
    

    file.inProgress = true;
    console.log("uploading now")  
    this.fileService.upload(file.data, formData).pipe(  
      // map(event => {  
      //   switch (event.type) {  
      //     case HttpEventType.UploadProgress:  
      //       file.progress = Math.round(event.loaded * 100 / event.total);  
      //       break;  
      //     case HttpEventType.Response:  
      //       return event;  
      //   }  
      // }),  
      catchError((error: HttpErrorResponse) => {  
        file.inProgress = false;  
        return of(`${file.data.name} upload failed.`);  
      })).subscribe((event: any) => {  
        if (typeof (event) === 'object') {  
          console.log(event.body);  
        }  
      });  
  }
}
