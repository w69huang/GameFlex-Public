import { Component, OnInit } from '@angular/core';
import { FileService } from '../services/file.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-file-list',
  templateUrl: './file-list.component.html',
  styleUrls: ['./file-list.component.scss']
})
export class FileListComponent implements OnInit {
public fileList$: Observable<string[]> = this.fileService.list();

 constructor(private fileService: FileService) { }

 public download(fileName: string):  void {
   this.fileService.download(fileName);
 }

 public remove(fileName: string):  void {
   this.fileService.remove(fileName);
 }

 ngOnInit(): void {
 }
}