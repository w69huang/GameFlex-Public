import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpErrorResponse, HttpEventType } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { BehaviorSubject, Subject, Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { WebService } from '../services/web.service';

@Injectable({
  providedIn: 'root'
})
export class FileService {
  private fileList: string[] = new Array<string>();
  private fileList$: Subject<string[]> = new Subject<string[]>();

  constructor(private httpClient: HttpClient, private webService: WebService) { }

  public upload(fileName: string, fileContent: FormData) {
    this.fileList.push(fileName);
    this.fileList$.next(this.fileList);
    console.log(fileContent);
    return this.webService.post('upload', fileContent, true);
  }

  public download(fileName: string): any {
    console.log(`image/${fileName}`);
    return this.webService.getWithArgs(`image/${fileName}`, {responseType: 'text'}, true);
  }

  public remove(fileName): void {
    this.webService.post('file/del', {"id": fileName}, true).subscribe();
    //console.log('file/del/'+fileName);
    this.fileList.splice(this.fileList.findIndex(name => name === fileName), 1);
    this.fileList$.next(this.fileList);
  }

  public list(): any {
    return this.webService.get('files', true);
    //return this.fileList$;
  }

  private addFileToList(filename: string): void {
    this.fileList.push(filename);
    this.fileList$.next(this.fileList);
  }
}
