import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { faUserFriends, faTableTennis, faPen, faUserShield, faCogs } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss']
})
export class WelcomeComponent implements OnInit {

  isLoggedIn = JSON.parse(localStorage.getItem('loggedIn') || 'false');

  public faUserFriends = faUserFriends;
  public faTableTennis = faTableTennis;
  public faPen = faPen;
  public faUserShield = faUserShield;
  public faCogs = faCogs;

  constructor(public router: Router) { }

  ngOnInit(): void {
  }

}
