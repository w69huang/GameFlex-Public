"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.DummyComponent = void 0;
var core_1 = require("@angular/core");
var http_1 = require("@angular/common/http");
var DummyComponent = /** @class */ (function () {
    function DummyComponent(http) {
        this.http = http;
        this.getbox = '1221312321';
    }
    DummyComponent.prototype.log = function (x) {
        // console.log(x);
        // console.log(this.username);
        // console.log(this.password);
        // console.log(this.email);
    };
    ;
    DummyComponent.prototype.onSubmit = function (x) {
        console.log(x.form.value);
        this.onCreatePost(x.form.value);
    };
    ;
    DummyComponent.prototype.onCreatePost = function (postData) {
        console.log("heree");
        console.log(postData);
        this.http.post('http://localhost:5000/test/testcreate', postData).subscribe(function (responseData) {
            console.log(responseData);
        });
    };
    DummyComponent.prototype.onGetUser = function (username) {
        console.log("Get User", username.value);
        this.http.get('http://localhost:5000/test/testget', username).subscribe(function (responseData) {
            console.log(responseData);
        });
    };
    DummyComponent.prototype.onGetAll = function () {
        var _this = this;
        console.log("Get All");
        this.http.get('http://localhost:5000/test/testgetall').subscribe(function (responseData) {
            console.log("This Response Data");
            console.log(responseData);
            _this.getbox = JSON.stringify(responseData);
        });
    };
    DummyComponent.prototype.onUpdate = function (x) {
        console.log("Update User");
        console.log(x.form.value);
        this.http.put('http://localhost:5000/test/testupdate', x.form.value).subscribe(function (responseData) {
            console.log(responseData);
        });
    };
    // http.delete(url, options). There is no body sent inside of delete. So must create a new options 
    // header and send that with a body instead. 
    DummyComponent.prototype.onDelete = function (x) {
        console.log("Delete User");
        console.log(x.form.value);
        var options = {
            headers: new http_1.HttpHeaders({
                'Content-Type': 'application/json'
            }),
            body: {
                userID: x.form.value.userID
            }
        };
        this.http["delete"]('http://localhost:5000/test/testdelete', options).subscribe(function (responseData) {
            console.log(responseData);
        });
    };
    DummyComponent = __decorate([
        core_1.Component({
            selector: 'dummy',
            templateUrl: './dummy.component.html',
            styleUrls: ['./dummy.component.scss']
        })
    ], DummyComponent);
    return DummyComponent;
}());
exports.DummyComponent = DummyComponent;
