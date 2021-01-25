import { Component, OnInit, ViewChild, ElementRef  } from '@angular/core';
import { HttpEventType, HttpErrorResponse } from '@angular/common/http';
import { of } from 'rxjs';  
import { catchError, map } from 'rxjs/operators';  
import { FileService } from '../services/file.service';
import { DeckService } from '../services/deck.service';
import { MatDialog } from '@angular/material/dialog';
import { UploadCardsPopupComponent } from '../popups/create-deck-popup/upload-cards-popup.component';
import { MiddleWare } from '../services/middleware';

class deckObject {
  deckName: string;
  deckID: string;
}


@Component({
  selector: 'app-deck-editor',
  templateUrl: './deck-editor.component.html',
  styleUrls: ['./deck-editor.component.scss']
})
export class DeckEditorComponent implements OnInit {
  @ViewChild("fileUpload", {static: false}) fileUpload: ElementRef; files = []
  @ViewChild('errorsDiv') errorsDiv: ElementRef;

  public deckList$: deckObject[] = [];

  constructor(private deckService: DeckService, private fileService: FileService, private dialog: MatDialog, private middleWare: MiddleWare) {
    const username: string = this.middleWare.getUsername();
    this.deckService.list(username).subscribe((data) => {
      for (var i = 0; i < data.length; i++) {
        var deckData = data[i];
        this.deckList$.push({deckID: deckData._id, deckName: deckData.deckName});
      }
     });
   }

  ngOnInit(): void {}

  //TEST THIS! DEC 15th
  createDeck(deckName: string) {
    if(deckName === ""){
      this.errorsDiv.nativeElement.innerHTML = "Please enter a deck name.";
      return 0;
    };

    //check for duplicate deck name
    if(this.deckList$.some(el => el.deckName === deckName)){
      this.errorsDiv.nativeElement.innerHTML = "A deck of this name already exists.";
      return 0; 
    };
    const username: string = this.middleWare.getUsername();
    this.deckService.createDeck(username, deckName).subscribe((data: {message: string, deck: deckObject}) => {
      if(data.deck){ 
        this.deckList$.push(data.deck); 
        //Is this the best way of doing this? 
        this.errorsDiv.nativeElement.innerHTML = "";
      }     
    });
  }

  editDeck(deckName: string) {
    const username: string = this.middleWare.getUsername();

    let dialogRef = this.dialog.open(UploadCardsPopupComponent, {
      height: '70%',
      width: '70%',
      data: { 
        deckNameData: deckName,
        userID: username
      }
    });

    // dialogRef.afterClosed().subscribe(deckData => {
    //   const deckName: string = deckData.name;
    //   const username: string = this.middleWare.getUsername();

    //   deckData.files?.forEach(file => {  
    //     this.uploadFile(file, deckName, username);  
    //   });
    // });
   }

  public deleteDeck(deckName: string) {
    const username: string = this.middleWare.getUsername();
    console.log("delete deck: " + deckName);
    this.deckService.deleteDeck(username, deckName).subscribe((data) => {
      this.deckList$ = this.deckList$.filter((deck: deckObject) => {
        return deck.deckName !== deckName;   
      });
    });
   }

  public download(fileName: string):  void {
    //TODO: Dont have this hard coded! File names and ID's should be accesible
    fileName = fileName;
    this.fileService.download(fileName).subscribe((data) => {
      
     //render base64 image to screen
      var outputImage: HTMLImageElement = document.createElement('img');
      outputImage.height = 200;
      outputImage.width = 200; 
      outputImage.src = 'data:image/jpg;base64,'+data;
      document.body.appendChild(outputImage);
    });
  }
 
  // TODO: Take the deckName and pass it into the service call to the backend when we upload a file
  // That way, we can associate the file with a name on the backend
  // --> Also, we'll probably want to pass in the player's username
  // uploadFile(file, deckName: string, username: string) {  
  //   const formData = new FormData();  
  //   formData.append('file', file.data);
  //   formData.append('deckName', deckName);
  //   formData.append('username', username);

  //   //Using the "new" fileService
  //   //this.fileService.upload(file.data.name, formData)
    
  //   file.inProgress = true;
  //   console.log("uploading now...")  
  //   this.fileService.upload(file.data, formData).pipe(  
  //     // map(event => {  
  //     //   switch (event.type) {  
  //     //     case HttpEventType.UploadProgress:  
  //     //       file.progress = Math.round(event.loaded * 100 / event.total);  
  //     //       break;  
  //     //     case HttpEventType.Response:  
  //     //       return event;  
  //     //   }  
  //     // }),  
  //     catchError((error: HttpErrorResponse) => {  
  //       file.inProgress = false;  
  //       return of(`${file.data.name} upload failed.`);  
  //     })).subscribe((event: any) => {  
  //       if (typeof (event) === 'object') {  
  //         console.log(event.body);  
  //       }  
  //     });  
  // }
}
