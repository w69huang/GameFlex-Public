import { Component, OnInit, ViewChild, ElementRef, EventEmitter } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import { Inject } from '@angular/core';

@Component({
  selector: 'app-create-deck-popup',
  templateUrl: './upload-cards-popup.component.html',
  styleUrls: ['./upload-cards-popup.component.scss']
})
export class UploadCardsPopupComponent implements OnInit {
  @ViewChild('errorsDiv') errorsDiv: ElementRef;
  @ViewChild("fileUpload", {static: false}) fileUpload: ElementRef; 

  private files: any[] = [];
  deckNameData: string;

  //deckname emitter
  public deckNameEmitter: EventEmitter<string> = new EventEmitter<string>();

  constructor(
    private dialogRef: MatDialogRef<UploadCardsPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    this.deckNameData = this.data.deckNameData;
    console.log(this.data);
    this.deckNameEmitter.emit(this.deckNameData);
  }

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
        this.files.push({ data: file, inProgress: false, progress: 0});
      }  
    };  
    fileUpload.click();  
  }
}
