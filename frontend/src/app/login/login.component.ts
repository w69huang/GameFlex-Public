import { Component, OnInit, Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { MiddleWare } from '../services/middleware';
import { AppComponent } from '../app.component';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import { Data } from 'phaser';
import { UsersService } from '../services/users.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  constructor(
    public dialog: MatDialog, 
    private http: HttpClient, 
    private router: Router, 
    private middleware: MiddleWare, 
    private app: AppComponent,
    private usersService: UsersService) { 
  }


  ngOnInit(): void {

    this.checkLoggedIn();
  }
  failedLogin = false;
  blockLogin = false;
  username="";
  password="";

  checkLoggedIn() {
    if ( this.middleware.isLoggedIn()) {
      this.router.navigate(['/playspace']);
    }
  }

  onSubmit(obj) {
    // NOTE: This code is to prevent login access if user fails to login 5 times.
    // if (parseInt(localStorage.getItem('failedLogin')) >= 5) {
    //   console.log("Banned From Login");
    // }

    if (obj.value.username != '' && obj.value.password != '') {
      this.usersService.checkLogin(obj)
        .subscribe(
          data => {
            if (data == true) {
              // TO DO:
              // 1. Reroute the user to the homepage. (For now let it be the playspace.) (Done)
              // 2. Store the password in a global variable or a session type object. (Done thru middleware)
              // 3. Create an indicator of them being logged in. (Done. Logout button appears and signup and loging are removed)
              this.middleware.setLoggedIn(true, obj.value.username, obj.value.password);
              console.log("Login Status: " + this.middleware.isLoggedIn());
              this.app.isLoggedIn = true;
              this.router.navigate(['/playspace']);
            } else {
              // TO DO:
              // 1. Reject their login attempt and keep them on the login page (Done)
              // 2. Alert message saying their login info is wrong (dont specify which one) (Done)
              // 3. Keep track of the number of login attempts. Lock them out after say 5 failed attempts (If time allows).

              this.middleware.setLoggedIn(false, '', '');
              //This is for the lock out. 
              // this.middleware.incFailedlogin();
              this.failedLogin = true;
            }
          }
        )
    }
  }

  openForgotPassword() {
    const dialogRef = this.dialog.open(DialogForgotPassword, {
      width: '250px'
    });
    dialogRef.afterClosed()
      .subscribe(result => {
        console.log("Close Dialog");
      })
  }
}

@Component({
  selector: 'dialog_forgot_password',
  templateUrl:'dialog_forgot_password.html',
})
export class DialogForgotPassword {
  constructor(
    public dialogRef: MatDialogRef<DialogForgotPassword>,
    private http: HttpClient,
    private usersService: UsersService
  ) {
  }
  emailExists = true;

  onCancel(): void {
    this.dialogRef.close()
  }

  onSubmit(email) {
    // Do email stuff. Send this stuff and then send the person an email or something.
    this.usersService.checkEmail(email)
      .subscribe( responseData => {
        if (responseData instanceof Array) {
          if (responseData.length >= 1) {
            this.dialogRef.close();
            this.emailExists = true;
            this.usersService.sendEmail(email)
              .subscribe( responseData => {
                if (responseData == true) {
                  console.log("Email sent and password changed!")
                } else {
                  console.log("Email failed....")
                }
              })
          } else {
            this.emailExists = false;
          }
          // Send email
        } else {
          this.emailExists = false;
        }
      });
  }
}