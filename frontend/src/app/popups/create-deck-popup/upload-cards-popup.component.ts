import { Component, OnInit, ViewChild, ElementRef, EventEmitter } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import { Inject } from '@angular/core';
// import { FontAwesomeModule, FaIconLibrary  } from '@fortawesome/angular-fontawesome';
import { faCoffee, fas } from '@fortawesome/free-solid-svg-icons';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';


@Component({
  selector: 'app-create-deck-popup',
  templateUrl: './upload-cards-popup.component.html',
  styleUrls: ['./upload-cards-popup.component.scss']
})
export class UploadCardsPopupComponent implements OnInit {
  @ViewChild('errorsDiv') errorsDiv: ElementRef;
  @ViewChild("fileUpload", {static: false}) fileUpload: ElementRef;
  faCoffee = faCoffee; 

  public files: any[] = [];
  deckNameData: string;

  //deckname emitter
  public deckNameEmitter: EventEmitter<string> = new EventEmitter<string>();

  constructor(
    private dialogRef: MatDialogRef<UploadCardsPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    library: FaIconLibrary
  ) { 
    library.addIconPacks(fas);
    library.addIcons(faCoffee);
  }

  ngOnInit(): void {
    this.deckNameData = this.data.deckNameData;
    console.log(this.data);
    setTimeout(() => {this.deckNameEmitter.emit(this.deckNameData)} ,100); 
  }

  // deckEmitter(): void {
  //   this.deckNameEmitter.emit(this.deckNameData)
  // }

  cancel(): void {
    this.dialogRef.close();
  }

  submit(): void {
    this.dialogRef.close({ name: this.deckNameData, files: this.files });
  }

  upload() {  
    const fileUpload = this.fileUpload.nativeElement;
    fileUpload.onchange = () => {  
      for (let index = 0; index < fileUpload.files.length; index++) {  
        const file = fileUpload.files[index];  
        console.log(file);
        this.files.push({ data: file, inProgress: false, progress: 0});
      }  
    };  
    fileUpload.click();  
  }

  removeStagedCard(cardData: any){
    console.log(cardData);
    this.files = this.files.filter((fileObject: any) => {
      return fileObject.data.name !== cardData.name;
    });
  }
}
