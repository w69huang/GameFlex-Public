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
  // private fileList: string[] = new Array<string>();
  // private fileList$: Subject<string[]> = new Subject<string[]>();

  constructor(private httpClient: HttpClient, private webService: WebService) { }

  public upload(fileData: any, fileContent: FormData) {
    // this.fileList.push(fileData);
    // this.fileList$.next(this.fileList);
    return this.webService.post('upload', fileContent, true);
  }

  public download(fileName: string): any {
    console.log(`image/${fileName}`);
    return this.webService.getWithArgs(`image/${fileName}`, {responseType: 'text'}, true);
  }

  public remove(id: string): void {
    this.webService.post('file/del', {"id": id}, true).subscribe();
    //console.log('file/del/'+fileName);
    // this.fileList.splice(this.fileList.findIndex(name => name === fileName), 1);
    // this.fileList$.next(this.fileList);
  }

  public list(deckName: string, userID: string): any {
    console.log("Give me " + deckName);
    console.log(typeof deckName);
    return this.webService.get(`files?deckName=${deckName}&userID=${userID}`, true);
    //return this.fileList$;
  }

  private addFileToList(filename: string): void {
    // this.fileList.push(filename);
    // this.fileList$.next(this.fileList);
  }
}
