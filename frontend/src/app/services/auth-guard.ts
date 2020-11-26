import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { MiddleWare } from './middleware';

@Injectable()
export class AuthGuard implements CanActivate {
    // base_url: string;
    routeURL: string;    
    constructor(private router: Router, private middleWare: MiddleWare){
        this.routeURL = this.router.url;
    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        console.log(route);
        console.log(state);
        if(this.middleWare.isLoggedIn()){
            if(state.url == '/login' || state.url == '/signup') {
                this.router.navigate(['']);
                return false;
            }
            return true;
        } else {
            if(state.url == '/joinByCode' || state.url == '/playspace' || state.url == '/deckEditor' || state.url == '/gameBrowser'){
                this.router.navigate(['/login']);
                return false;
            }
            return true;
        }
        return true;
    }
}