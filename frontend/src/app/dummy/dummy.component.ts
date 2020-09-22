import { Component, OnInit } from '@angular/core';
import { Dummy } from './dummy';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'dummy',
  templateUrl: './dummy.component.html',
  styleUrls: ['./dummy.component.scss']
})
export class DummyComponent{
  constructor(private http: HttpClient) {}
  getbox: string = '1221312321';
  log(x) {
    // console.log(x);
    // console.log(this.username);
    // console.log(this.password);
    // console.log(this.email);
  };

  onSubmit(x) { 
    console.log(x.form.value);
    this.onCreatePost(x.form.value);
  };

  onCreatePost(postData: {username:string, password:string, email:string}){
    console.log("heree");
    console.log(postData);
    this.http.post(
      'http://localhost:5000/test/testcreate', 
      postData).subscribe(
        responseData => {
          console.log(responseData);
      });
  }

  onGetUser( username) {
    console.log("Get User", username);
    this.http.get(
      'http://localhost:5000/test/testget', 
      username).subscribe(
        responseData => {
          console.log(responseData);
        });
  }

  onGetAll() {
    console.log("Get All");
    this.http.get(
      'http://localhost:5000/test/testgetall',
    ).subscribe(
      responseData => {
        console.log("This Response Data");
        console.log(responseData);
        this.getbox = 'test';
      }
    );
  }

  onUpdate(x) {
    console.log("Update User");
    this.http.put(
      'http://localhost:5000/test/testupdate',
      x.form.value
    ).subscribe(
      responseData => {
        console.log(responseData);
      }
    );
  }

  onDelete(username) {
    console.log("Delete User");
    this.http.delete(
      'http://localhost:5000/test/testdelete',
      username).subscribe(
        responseData => {
          console.log(responseData);
        }
      );
  }

  // newDummy(){
  //    var model = new Dummy(username, password, email);
  // }
}
