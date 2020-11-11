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
    host = "http://localhost:5000"
    // host = "http://104.155.129.45"
    createUser(object) {
        return this.http.post(this.host+'/user/create', object.value, {headers: this.corsHeaders})
    };

    getUser(object) {
        return this.http.post(this.host+'/user/get', object.value, {headers: this.corsHeaders})
    }

    checkEmail(object) {
        return this.http.post(this.host+'/user/checkemail', object.value, {headers: this.corsHeaders})
    }

    sendEmail(object) {
        return this.http.post(this.host+'/user/checkemail', object.value, {headers: this.corsHeaders})
    }

    checkLogin(object) {
        return this.http.post(this.host+'/user/checklogin', object.value, {headers: this.corsHeaders})
    }

    changePassword(object) {
        return this.http.post(this.host+'/user/changepassword', object.value, {headers: this.corsHeaders});
    }
}