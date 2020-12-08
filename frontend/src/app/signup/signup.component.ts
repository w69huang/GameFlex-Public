import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { Router } from '@angular/router';
import { UsersService } from '../services/users.service';
@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {

  constructor( 
    private http: HttpClient, 
    private router: Router,
    private usersService: UsersService) { }

  ngOnInit(): void {
  }
  
  username: string ="";
  password: string ="";
  confirmPassword: string ="";
  email: string ="";

  userExists = false;
  emailExists = false;
  passwordMatch = true;
  passwordMissing = false;
  invalidPwd = false;
  invalidUser = false;

  onSubmit(obj) {
    // Does SQL checks to confirm if a username exists or an email address is in use;
    if (obj.value.password != obj.value.confirmPassword) {
      this.passwordMatch = false;
      return null;
    } else {
      this.passwordMatch= true;
    }
    if (obj.value.password == "" && obj.value.confirmPassword == "") {
      this.passwordMissing = true;
      return null;
    } else {
      this.passwordMissing = false;
    }

    if (obj.value.password.length < 8) {
      this.invalidPwd = true;
      return null;
    } else {
      this.invalidPwd = false;
    }

    if (obj.value.username.length < 3) {
      this.invalidUser = true;
      return null;
    } else {
      this.invalidUser = false;
    }

    if (obj.value.username != '' && obj.value.email != '') {

      forkJoin(
      [this.usersService.getUser(obj),
        this.usersService.checkEmail(obj)]
      ).subscribe(
        data => {
          if(data instanceof Array && data[0] instanceof Array && data[1] instanceof Array) {
              if (data[0].length >= 1){ 
              this.userExists = true;
            } else {
              this.userExists = false;
            }
            if (data[1].length >= 1) {
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
    obj.value['userID'] = this.hash(obj.value.username);
    this.usersService.createUser(obj)
      .subscribe( responseData => {
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
    return Math.abs(hash);
  }
}