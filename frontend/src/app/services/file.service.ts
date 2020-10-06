import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpErrorResponse, HttpEventType } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { BehaviorSubject, Subject, Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { WebService } from '../web.service';

@Injectable({
  providedIn: 'root'
})
export class FileService {
  SERVER_URL: string = "http://localhost:4000/"; 
  private fileList: string[] = new Array<string>();
  private fileList$: Subject<string[]> = new Subject<string[]>();

  constructor(private httpClient: HttpClient, private webService: WebService) { }

  public upload(fileName: string, fileContent: FormData) {
    this.fileList.push(fileName);
    this.fileList$.next(this.fileList);
    return this.webService.post('upload', fileContent, {
      reportProgress: true,
      observe: 'events'
    });
  }

  public download(fileName: string): void {

  }

  public remove(fileName): void {
    this.fileList.splice(this.fileList.findIndex(name => name === fileName), 1);
    this.fileList$.next(this.fileList);
  }

  public list(): any {
    return this.webService.get('files');
    //return this.fileList$;
  }

  private addFileToList(filename: string): void {
    this.fileList.push(filename);
    this.fileList$.next(this.fileList);
  }
}
