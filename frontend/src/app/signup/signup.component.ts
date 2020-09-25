import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }
  
  username: string ="";
  password: string ="";
  confirmPassword: string ="";
  email: string ="";

  onSubmit(obj) {
    // Does SQL checks to confirm if a username exists or an email address is in use;
    console.log(obj);
  }

  onRegister(obj) {
    // Confirms the SQL check and creates a new user into the sql table
    console.log(obj);
  }





}
