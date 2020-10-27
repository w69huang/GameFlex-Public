import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class WebService {
  readonly ROOT_URL_MYSQL;
  readonly ROOT_URL_MONGO;

  constructor (private http: HttpClient) {
    this.ROOT_URL_MYSQL = "http://localhost:5000";
    this.ROOT_URL_MONGO = "http://localhost:3000";
  }

  get (uri: string, useMongo?: boolean) {
    return this.http.get(`${useMongo ? this.ROOT_URL_MONGO : this.ROOT_URL_MYSQL}/${uri}`);
  }

  post (uri: string, payload: Object, useMongo?: boolean) {
    // 2nd param is the body of the request
    return this.http.post(`${useMongo ? this.ROOT_URL_MONGO : this.ROOT_URL_MYSQL}/${uri}`, payload);
  }

  patch (uri: string, payload: Object, useMongo?: boolean) {
    return this.http.patch(`${useMongo ? this.ROOT_URL_MONGO : this.ROOT_URL_MYSQL}/${uri}`, payload);
  }

  delete (uri: string, useMongo?: boolean) {
    return this.http.delete(`${useMongo ? this.ROOT_URL_MONGO : this.ROOT_URL_MYSQL}/${uri}`);
  }
}
