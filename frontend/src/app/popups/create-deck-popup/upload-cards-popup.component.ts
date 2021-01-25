import { Component, OnInit, ViewChild, ElementRef, EventEmitter } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import { Inject } from '@angular/core';
// import { FontAwesomeModule, FaIconLibrary  } from '@fortawesome/angular-fontawesome';
import { faCoffee, fas } from '@fortawesome/free-solid-svg-icons';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { MiddleWare } from 'src/app/services/middleware';
import { FileService } from 'src/app/services/file.service';
import { catchError } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { of } from 'rxjs';


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
    library: FaIconLibrary,
    private middleWare: MiddleWare,
    private fileService: FileService,
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
    this.dialogRef.close({ name: this.deckNameData });
  }

  submit(): void {
    // this.dialogRef.close({ name: this.deckNameData, files: this.files });
    const deckName: string = this.deckNameData
    const username: string = this.middleWare.getUsername();
    const numberOfFiles = this.files.length;
    const fileData = []; 

    this.files?.forEach(file => {
        fileData.push(file.data);   
      });
      this.uploadFile(fileData, deckName, username); 
      this.files = [];
  }

  // ngOnDestroy(): void {
  //   this.dialogRef.close({ name: this.deckNameData });
  // }

  upload() {  
    const fileUpload = this.fileUpload.nativeElement;
    fileUpload.onchange = () => {  
      for (let index = 0; index < fileUpload.files.length; index++) {  
        const file = fileUpload.files[index];  
        console.log(file);
        if (file.type != 'image/png' && file.type !=='image/PNG' && file.type !== 'image/jpg' && file.type !== 'image/jpeg') {
          alert("Only PNG or JPEG files can be uploaded!");
          continue;
        } 
        if (file.size > 1000000) {
          alert(`${file.name} is too large to upload. Please select an image 1mb or smaller`);
          continue; 
        }
        this.files.push({ data: file });
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

  uploadFile(files, deckName: string, username: string) {  
    const formData = new FormData(); 

    files.forEach(file => {
      formData.append('files', file);
    });
    
    formData.append('deckName', deckName);
    formData.append('username', username);

    // console.log(formData); 

    this.fileService.upload(files, formData).pipe(  
      catchError((error: HttpErrorResponse) => {   
        return of(`upload failed.`);  
      })).subscribe((event: any) => {

        this.deckNameEmitter.emit(this.deckNameData);
      });  
  }
}
