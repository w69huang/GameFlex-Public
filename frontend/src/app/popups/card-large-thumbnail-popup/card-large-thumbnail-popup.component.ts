import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-card-large-thumbnail-popup',
  templateUrl: './card-large-thumbnail-popup.component.html',
  styleUrls: ['./card-large-thumbnail-popup.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CardLargeThumbnailPopupComponent implements OnInit {

  constructor(
    private dialogRef: MatDialogRef<CardLargeThumbnailPopupComponent>, 
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {}

  ngOnInit(): void {
    var outputImage: HTMLImageElement = document.createElement('img');
    outputImage.src = 'data:image/jpg;base64,'+ this.data.base64;
    outputImage.width = 300;
    outputImage.height = 420; 
    outputImage.onclick = () => {
      this.dialogRef.close(); 
    }
    document.getElementById("cardThumbnailContainer").append(outputImage); 
  }

}
