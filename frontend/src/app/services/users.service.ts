import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class UsersService {
    constructor(private http: HttpClient) {

    }
    createUser(object) {
        return this.http.post('http://104.155.129.45/user/create', object.value)
    };

    getUser(object) {
        return this.http.post('http://104.155.129.45/user/get', object.value)
    }

    checkEmail(object) {
        return this.http.post('http://104.155.129.45/user/checkemail', object.value)
    }

    sendEmail(object) {
        return this.http.post('http://104.155.129.45/user/checkemail', object.value)
    }

    checkLogin(object) {
        return this.http.post('http://104.155.129.45/user/checklogin', object.value)
    }

    changePassword(object) {
        return this.http.post('http://104.155.129.45/user/changepassword', object.value);
    }
}