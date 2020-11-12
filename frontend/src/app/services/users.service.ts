import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable()
export class UsersService {
    private corsHeaders: HttpHeaders;
    constructor(private http: HttpClient) {
        this.corsHeaders = new HttpHeaders({
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Access-Control-Allow-Origin': '*'
        });

    }
    createUser(object) {
        return this.http.post('http://localhost:5000/user/create', object.value, {headers: this.corsHeaders})
    };

    getUser(object) {
        return this.http.post('http://localhost:5000/user/get', object.value, {headers: this.corsHeaders})
    }

    checkEmail(object) {
        return this.http.post('http://localhost:5000/user/checkemail', object.value, {headers: this.corsHeaders})
    }

    sendEmail(object) {
        return this.http.post('http://localhost:5000/user/checkemail', object.value, {headers: this.corsHeaders})
    }

    checkLogin(object) {
        return this.http.post('http://localhost:5000/user/checklogin', object.value, {headers: this.corsHeaders})
    }

    changePassword(object) {
        return this.http.post('http://localhost:5000/user/changepassword', object.value, {headers: this.corsHeaders});
    }
}