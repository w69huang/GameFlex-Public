import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  constructor(private router: Router) {

  }
  title = 'frontend';

  isLoggedIn = JSON.parse(localStorage.getItem('loggedIn') || 'false');
  
  signOut() {
    localStorage.setItem('loggedIn', 'false');
    localStorage.setItem('username', '');
    localStorage.setItem('password', '');
    this.isLoggedIn = false;
    this.router.navigate(['/login']);
  }
}
