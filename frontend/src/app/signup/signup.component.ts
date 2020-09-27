import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { Router } from '@angular/router';
@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {

  constructor( private http: HttpClient, private router: Router) { }

  ngOnInit(): void {
  }
  
  username: string ="";
  password: string ="";
  confirmPassword: string ="";
  email: string ="";

  userExists = false;
  emailExists = false;
  passwordMatch = true;

  onSubmit(obj) {
    // Does SQL checks to confirm if a username exists or an email address is in use;
    // console.log(obj);
    if (obj.value.password != obj.value.confirmPassword) {
      this.passwordMatch = false;
    } else {
      this.passwordMatch= true;
    }
    console.log(this.passwordMatch)
    console.log(obj.value.username);
    if (obj.value.username != '' && obj.value.email != '') {
      // this.http.post('http://localhost:5000/user/userget', obj.value)
      //   .subscribe((responseData) => {
      //     console.log(responseData)
      //     if(responseData instanceof Array) {
      //       if (responseData.length >= 1){ 
      //         // UserID exists.
      //         this.userExists = true;
      //       } else {
      //         this.userExists = false;
      //       }
      //       console.log("Successfully sent SQL");
      //     } else {
      //       console.log("Failed to either send data or SQL failed.")
      //     }
      //   });
      // this.http.post('http://localhost:5000/user/checkemail', obj.value)
      //   .subscribe( (responseData) => {
      //     console.log(responseData);
      //     if(responseData instanceof Array) {
            // if(responseData.length >= 1) {
            //   this.emailExists = true;
            // } else {
            //   this.emailExists = false;
            // }
      //     } else {
      //       console.log("SQL failed somewhere")
      //     }
      //   });

      forkJoin(
        this.http.post('http://localhost:5000/user/userget', obj.value),
        this.http.post('http://localhost:5000/user/checkemail', obj.value)
      ).subscribe(
        data => {
          if(data instanceof Array && data[0] instanceof Array && data[1] instanceof Array) {
            if (data[0].length >= 1){ 
              // UserID exists.
              this.userExists = true;
            } else {
              this.userExists = false;
            }
            if(data[1].length >= 1) {
              this.emailExists = true;
            } else {
              this.emailExists = false;
            } 
          }else {
            console.log("Failed to either send data or SQL failed.")
          }
          if (!this.userExists && !this.emailExists) {
            this.onRegister(obj);
          }
        });
      }
  };

  onRegister(obj) {
    // Confirms the SQL check and creates a new user into the sql table
    console.log(obj);
    obj.value['userID'] = this.hash(obj.value.username);
    // console.log(obj.userID);
    this.http.post('http://localhost:5000/user/usercreate', obj.value)
      .subscribe( responseData => {
        console.log("Created");
        this.router.navigate(['/login'])
      })
  }

  hash(string) {
    var i, char;
    var hash = 0;
    for(i = 0; i < string.length; i ++) {
      char = string.charCodeAt(i);
      hash = ((hash<< 5) - hash) + char;
      hash = hash & hash;
    }

    return hash;
  }



}
