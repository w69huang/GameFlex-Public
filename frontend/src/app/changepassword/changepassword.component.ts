import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UsersService } from '../services/users.service';

@Component({
  selector: 'app-changepassword',
  templateUrl: './changepassword.component.html',
  styleUrls: ['./changepassword.component.scss']
})
export class ChangepasswordComponent implements OnInit {

  constructor(private usersService: UsersService, private router: Router) { }

  ngOnInit(): void {
  }

  passwordCorrect = null;
  passwordMatch = null;
  onSubmit(form) {
    console.log(form);
    // To do:
    // 1. Check password
    // 2. check new passwords match
    // 3. Submit new password
    // 4. Send success message. Don't reroute.
    if (localStorage.getItem("password") == form.value.previousPassword) {
      if (form.value.newPassword == form.value.confirmPassword) {
        form.value["username"] = localStorage.getItem("username");
        this.usersService.changePassword(form)
          .subscribe( responseData => {
            if (responseData == true) {
              alert("Password Changed!");
              this.router.navigate(['/']);
            } else {
              window.alert("Error");
            }
          })
        this.passwordMatch = true;
      } else {
        this.passwordMatch = false;
      }
      this.passwordCorrect = true;
    } else {
      console.log("Password Incorrect.")
      this.passwordCorrect = false;
    }
  }

}
