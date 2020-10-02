import { Component, OnInit, Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { MiddleWare } from '../services/middleware';
import { AppComponent } from '../app.component';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import { Data } from 'phaser';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  constructor(public dialog: MatDialog, private http: HttpClient, private router: Router, private middleware: MiddleWare, private app: AppComponent) { 
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
    console.log(obj)
    // NOTE: This code is to prevent login access if user fails to login 5 times.
    // if (parseInt(localStorage.getItem('failedLogin')) >= 5) {
    //   console.log("Banned From Login");

    // }

    if (obj.value.username != '' && obj.value.password != '') {
      this.http.post('http://localhost:5000/user/checklogin', obj.value)
        .subscribe(
          data => {
            console.log("Help");
            console.log(data);
            if (data == true) {
              // TO DO:
              // 1. Reroute the user to the homepage. (For now let it be the playspace.) (Done)
              // 2. Store the password in a global variable or a session type object. (Done thru middleware)
              // 3. Create an indicator of them being logged in. (Done. Logout button appears and signup and loging are removed)
              this.middleware.setLoggedIn(true, obj.value.username, obj.value.password);
              console.log(this.middleware.isLoggedIn());
              this.app.isLoggedIn = true;
              this.router.navigate(['/playspace']);

            } else {
              
              // TO DO:
              // 1. Reject their login attempt and keep them on the login page (Done)
              // 2. Alert message saying their login info is wrong (dont specify which one) (Done)
              // 3. Keep track of the number of login attempts. Lock them out after say 5 failed attempts (If time allows).

              this.middleware.setLoggedIn(false, '', '');
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

// export interface DialogData {
//   email: string;
// }


@Component({
  selector: 'dialog_forgot_password',
  templateUrl:'dialog_forgot_password.html',
})
export class DialogForgotPassword {
  constructor(
    public dialogRef: MatDialogRef<DialogForgotPassword>,
    private http: HttpClient
  ) {
  }

  emailExists = true;

  onCancel(): void {
    this.dialogRef.close()
  }

  onSubmit(email) {
    console.log(email);
    // Do email stuff. Send this stuff and then send the person an email or something.
    this.http.post('http://localhost:5000/user/checkemail', email.value)
      .subscribe( responseData => {
        console.log(responseData);     
        if (responseData instanceof Array) {
          if (responseData.length >= 1) {
            this.dialogRef.close();
            this.emailExists = true;
            this.http.put('http://localhost:5000/user/sendEmail', email.value)
              .subscribe( responseData => {
                console.log(responseData)
                if (responseData == true) {
                  console.log("SENT SUCCESSFuLLY AND CHANGED!")
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