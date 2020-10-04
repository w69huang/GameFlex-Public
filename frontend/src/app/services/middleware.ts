import { Injectable } from '@angular/core';

@Injectable()
export class MiddleWare {
    private loggedInStatus = JSON.parse(localStorage.getItem('loggedIn') || 'false');
    private failedAttemps = parseInt(JSON.parse(localStorage.getItem('failedLogin') || '0'));
    setLoggedIn(value: boolean, username: string, password: string) {
        this.loggedInStatus = value;
        if (value == true) {
            localStorage.setItem('loggedIn', 'true');
            localStorage.setItem('username', username);
            localStorage.setItem('password', password)
        } else {
            localStorage.setItem('loggedIn', 'false');
            localStorage.setItem('username', '');
            localStorage.setItem('password', '')
        }
    }

    incFailedlogin() {
        var current = parseInt(JSON.parse(localStorage.getItem('failedLogin')));
        current = current + 1;
        localStorage.setItem('failedLogin', current.toString());
        return current;
    }

    clearFailedLogin() {
        localStorage.setItem('failedLogin', '0');

        return "cleared";
    }

    isLoggedIn() {
        return JSON.parse(localStorage.getItem('loggedIn') || this.loggedInStatus.toString());
    }

    getUserDetails(username, password) {
        //Get a specific user's data. Is this needed? Maybe. 
        return "to do";
    }
}