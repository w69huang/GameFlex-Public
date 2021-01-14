import { Component, OnInit, EventEmitter, Input, ComponentFactoryResolver, ViewEncapsulation } from '@angular/core';
import { FileService } from '../services/file.service';
import { Observable } from 'rxjs';
import { MiddleWare } from '../services/middleware';  
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { MatDialog } from '@angular/material/dialog';
import { CardLargeThumbnailPopupComponent } from '../popups/card-large-thumbnail-popup/card-large-thumbnail-popup.component';


class fileObject {
  fileName: string;
  fileID: string;
}

@Component({
  selector: 'app-file-list',
  templateUrl: './file-list.component.html',
  styleUrls: ['./file-list.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class FileListComponent implements OnInit {

public fileList$: fileObject[] = [];
public activelargeThumbnail: HTMLImageElement = null; 

//deckName emitter receiver
@Input() private deckNameEmitter: EventEmitter<string> = new EventEmitter<string>(); 



 constructor(private fileService: FileService, private middleWare: MiddleWare, private cfr: ComponentFactoryResolver, private dialog: MatDialog) { }

 public download(fileName: string):  void {
   //TODO: Dont have this hard coded! File names and ID's should be accesible
   fileName = fileName;
   this.fileService.download(fileName).subscribe((data) => {
     
    //render base64 image to screen
     console.log(data);
     var outputImage: HTMLImageElement = document.createElement('img');
     outputImage.height = 200;
     outputImage.width = 200; 
     outputImage.src = 'data:image/jpg;base64,'+data;
     document.body.appendChild(outputImage);
   });
 }

 public remove(id: string):  void {
   console.log("Delete image requested");
   this.fileService.remove(id).subscribe((data) => {
     if(data.success) {
      document.getElementById(`imageDisplayContainer-${id}`).remove();
     }
   });
 }

 public renderImages(imageArray: {base64: string, id: string, fileName: string}[]): void {
   //TODO : Toggle sort by filename (and others (?))
  imageArray.sort((a, b) => (a.fileName > b.fileName) ? 1: (b.fileName > a.fileName) ? -1 :0);
  imageArray.forEach((image: {base64: string, id: string}) => {

    var outputImage: HTMLImageElement = document.createElement('img');
     outputImage.src = 'data:image/jpg;base64,'+ image.base64;
     outputImage.classList.add('stdThumbnail');
     outputImage.onclick = () => { 
      let dialogRef = this.dialog.open(CardLargeThumbnailPopupComponent, {
        height: '420px',
        width: '300px',
        panelClass: 'largeCardThumbnailPopup', 
        data: { 
          base64: image.base64 
        }
      });

      //  //image is currently small
      //  if(outputImage.width === 100){
      //   if(this.activelargeThumbnail) {
      //     this.activelargeThumbnail.classList.add('stdThumbnail');
      //     this.activelargeThumbnail.classList.remove('lrgThumbnail');
      //    }
      //    this.activelargeThumbnail = outputImage;
      //    outputImage.classList.remove('stdThumbnail');
      //    outputImage.classList.add('lrgThumbnail');
      //  }
      //  //image is currently large
      //  else {
      //   outputImage.classList.add('stdThumbnail');
      //   outputImage.classList.remove('lrgThumbnail');
      //   this.activelargeThumbnail = null; 
      //  } 
     }

    var imageDisplayContainer: HTMLDivElement = document.createElement('div'); 
     imageDisplayContainer.setAttribute('id', `imageDisplayContainer-${image.id}`);
     imageDisplayContainer.appendChild(outputImage);
     imageDisplayContainer.style.setProperty('position', 'relative');
     imageDisplayContainer.style.setProperty('margin', '5px');
     

    var deleteImage: HTMLImageElement = document.createElement('img');
     deleteImage.setAttribute('id', 'deleteIconDisplay');
     deleteImage.height = 20;
     deleteImage.width = 20;
     deleteImage.src = 'assets/images/buttons/bigRedX.png';
     deleteImage.style.setProperty('position', 'absolute');
     deleteImage.style.setProperty('top', '10px');
     deleteImage.style.setProperty('left', '10px');
     deleteImage.onclick = () => {
      this.remove(image.id);
    };
     
     imageDisplayContainer.appendChild(deleteImage);
     document.getElementById("deckDisplayContainer").appendChild(imageDisplayContainer);
  });
  document.getElementById('loadingText').style.display = "none";
 } 

 public htmlToElement(html) {
   var template = document.createElement('template');
   html = html.trim();
   template.innerHTML = html;
   return template.content.firstChild;
 }

 ngOnInit(): void {

  const userID: string = this.middleWare.getUsername(); 
  this.deckNameEmitter.subscribe(deckName => {
    this.fileService.list(deckName, userID).subscribe((data) => {
      console.log(data);
      this.renderImages(data);
    });
  });
 }
}