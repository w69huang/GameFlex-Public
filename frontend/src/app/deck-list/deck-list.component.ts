import { Component, OnInit } from '@angular/core';
import { FileService } from '../services/file.service';
import { DeckService } from '../services/deck.service';
import { Observable } from 'rxjs';
import { MiddleWare } from '../services/middleware';

class fileObject {
  fileName: string;
  fileID: string;
}

@Component({
  selector: 'app-deck-list',
  templateUrl: './deck-list.component.html',
  styleUrls: ['./deck-list.component.scss']
})
export class DeckListComponent implements OnInit {
public deckList$: fileObject[] = [];


 constructor(private fileService: FileService, private deckService: DeckService, private middleWare: MiddleWare) { 

  const username: string = this.middleWare.getUsername();
   this.deckService.list(username).subscribe((data) => {
    for (var i = 0; i < data.files.length; i++) {
      var fileName = data.files[i];
      console.log(fileName);
      // this.fileList$.push(fileName.filename);
      this.deckList$.push({fileID: fileName._id, fileName: fileName.filename});
      console.log(this.deckList$);
    }
   });
  }

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

 ngOnInit(): void {
 }
}