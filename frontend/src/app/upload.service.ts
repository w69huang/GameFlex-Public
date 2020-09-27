import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpErrorResponse, HttpEventType } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { BehaviorSubject, Subject, Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UploadService {
  SERVER_URL: string = "http://localhost:4000/";
  constructor(private httpClient: HttpClient) { }

  public upload(formData) {
    return this.httpClient.post<any>(this.SERVER_URL, formData, {
      reportProgress: true,
      observe: 'events'
    });
  }
}

// export class UploadService {
//   private fileList: string[] = new Array<string>();
//   private fileList$: Subject<string[]> = new Subject<string[]>();
//   private displayLoader$: Subject<boolean> = new BehaviorSubject<boolean>(false);

//   constructor(private httpClient: HttpClient) { }

//   public isLoading(): Observable<boolean> {
//     return this.displayLoader$;
//   }

//   public upload(fileName: string, fileContent: string): void {
//     this.displayLoader$.next(true);
//     this.httpClient.put('/files', {name: fileName, content: fileContent})
//     .pipe(finalize(() => this.displayLoader$.next(false)))
//     .subscribe(res => {
//       this.fileList.push(fileName);
//       this.fileList$.next(this.fileList);
//     }, error => {
//       this.displayLoader$.next(false);
//     });
//   }
// }