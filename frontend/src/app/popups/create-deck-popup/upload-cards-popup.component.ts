import { Component, OnInit, ViewChild, ElementRef  } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-create-deck-popup',
  templateUrl: './upload-cards-popup.component.html',
  styleUrls: ['./upload-cards-popup.component.scss']
})
export class UploadCardsPopupComponent implements OnInit {
  @ViewChild('errorsDiv') errorsDiv: ElementRef;
  @ViewChild("fileUpload", {static: false}) fileUpload: ElementRef; 
  private files: any[] = [];

  constructor(
    private dialogRef: MatDialogRef<UploadCardsPopupComponent>
  ) { }

  ngOnInit(): void {
  }

  cancel(): void {
    this.dialogRef.close();
  }

  submit(name: string): void {
    if (name != "") {
      this.errorsDiv.nativeElement.innerHTML = "";
      this.dialogRef.close({ name: name, files: this.files });
    } else {
      this.errorsDiv.nativeElement.innerHTML = "Missing name field.";
    }
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
