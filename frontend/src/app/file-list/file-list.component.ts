import { Component, OnInit } from '@angular/core';
import { FileService } from '../services/file.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-file-list',
  templateUrl: './file-list.component.html',
  styleUrls: ['./file-list.component.scss']
})
export class FileListComponent implements OnInit {
public fileList$: string[] = [];


 constructor(private fileService: FileService) { 
   this.fileService.list().subscribe((data) => {
    for (var i = 0; i < data.files.length; i++) {
      var fileName = data.files[i];
      // this.fileList$.push(fileName.filename);
      this.fileList$.push(fileName._id);
    }
   });
  }

 public download(fileName: string):  void {
   fileName = "Screenshot_20180823-170541_Google.jpg";
   this.fileService.download(fileName).subscribe((data) => {
     
     var base64Res = btoa(data);
     var outputImage = document.createElement('img');
     outputImage.src = 'data:image/jpg;base64,'+base64Res;

     document.body.appendChild(outputImage);
   });
 }

 public remove(fileName: string):  void {
   this.fileService.remove(fileName);
 }

 ngOnInit(): void {
 }
}