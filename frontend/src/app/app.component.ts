import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import "jquery";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  title = 'frontend';

  isLoggedIn = JSON.parse(localStorage.getItem('loggedIn') || 'false');
  /**
   * A reference to the fontawesome bars icon
   */
  public faBars = faBars;

  constructor(private router: Router) {}
  
  signOut() {
    localStorage.setItem('loggedIn', 'false');
    localStorage.setItem('username', '');
    localStorage.setItem('password', '');
    this.isLoggedIn = false;
    this.router.navigate(['/login']);
  }

  toggleMenu() {
    if ($('.toolbarMobile').height() === 0) {
      $('.toolbarMobile').css('height', 294);
    } else {
      $('.toolbarMobile').css('height', 0);
    }
  }
}
