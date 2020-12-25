import { Component, OnInit, EventEmitter, Input } from '@angular/core';
import { FileService } from '../services/file.service';
import { Observable } from 'rxjs';
import { MiddleWare } from '../services/middleware'; 

class fileObject {
  fileName: string;
  fileID: string;
}

@Component({
  selector: 'app-file-list',
  templateUrl: './file-list.component.html',
  styleUrls: ['./file-list.component.scss']
})
export class FileListComponent implements OnInit {

public fileList$: fileObject[] = [];

//deckName emitter receiver
@Input() private deckNameEmitter: EventEmitter<string> = new EventEmitter<string>(); 


 constructor(private fileService: FileService, private middleWare: MiddleWare) { }

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

 public remove(fileName: string):  void {
   this.fileService.remove(fileName);
 }

 public renderImages(imageArray: string[]): void {
  imageArray.forEach((image: string) => {
    var outputImage: HTMLImageElement = document.createElement('img');
     outputImage.height = 200;
     outputImage.width = 200; 
     outputImage.src = 'data:image/jpg;base64,'+ image;
     document.getElementById("deckDisplay").appendChild(outputImage);
     var deleteIcon = this.htmlToElement('<fa-icon [icon]="faCoffee" size="xs"></fa-icon>');
     document.getElementById("deckDisplay").appendChild(deleteIcon);


  });
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