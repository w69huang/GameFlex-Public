import { Component, OnInit } from '@angular/core';
import { FileService } from '../services/file.service';
import { Observable } from 'rxjs';

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


 constructor(private fileService: FileService) { 
   this.fileService.list(deckName, userID).subscribe((data) => {
    for (var i = 0; i < data.files.length; i++) {
      var fileName = data.files[i];
      console.log(fileName);
      // this.fileList$.push(fileName.filename);
      this.fileList$.push({fileID: fileName._id, fileName: fileName.filename});
      console.log(this.fileList$);
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