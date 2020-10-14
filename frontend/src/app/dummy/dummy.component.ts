import { Component, OnInit } from '@angular/core';
import { Dummy } from './dummy';
import { HttpClient, HttpHeaders } from '@angular/common/http';

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

  onCreatePost(postData: {userID: string, username:string, password:string, email:string}){
    console.log("heree");
    console.log(postData);
    this.http.post(
      'http://localhost:5000/user/create', 
      postData).subscribe(
        responseData => {
          console.log(responseData);
      });
  }

  onGetUser(username) {
    console.log("Get User", username.value);
    this.http.get(
      'http://localhost:5000/user/get', 
      username).subscribe(
        responseData => {
          console.log(responseData);
        });
  }

  onGetAll() {
    console.log("Get All");
    this.http.get(
      'http://localhost:5000/user/getall',
    ).subscribe(
      responseData => {
        console.log("This Response Data");
        console.log(responseData);
        this.getbox = JSON.stringify(responseData);
      }
    );
  }

  onUpdate(x) {
    console.log("Update User");
    console.log(x.form.value)
    this.http.put(
      'http://localhost:5000/user/update',
      x.form.value
    ).subscribe(
      responseData => {
        console.log(responseData);
      }
    );
  }


  // http.delete(url, options). There is no body sent inside of delete. So must create a new options 
  // header and send that with a body instead. 
  onDelete(x) {
    console.log("Delete User");
    console.log(x.form.value)
    const options = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
      body: {
        userID: x.form.value.userID
      },
    };
    this.http.delete(
      'http://localhost:5000/user/delete', options).subscribe(
        responseData => {
          console.log(responseData);
        }
      );
  }

  // newDummy(){
  //    var model = new Dummy(username, password, email);
  // }
}
