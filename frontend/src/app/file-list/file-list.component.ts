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
      this.fileList$.push(fileName.filename);
    }
   });
  }

 public download(fileName: string):  void {
   this.fileService.download(fileName);
 }

 public remove(fileName: string):  void {
   this.fileService.remove(fileName);
 }

 ngOnInit(): void {
 }
}