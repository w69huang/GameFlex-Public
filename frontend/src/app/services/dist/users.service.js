"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.UsersService = void 0;
var core_1 = require("@angular/core");
var UsersService = /** @class */ (function () {
    function UsersService(http) {
        this.http = http;
    }
    UsersService.prototype.createUser = function (object) {
        return this.http.post('http://104.155.129.45:5000/user/create', object.value);
    };
    ;
    UsersService.prototype.getUser = function (object) {
        return this.http.post('http://104.155.129.45:5000/user/get', object.value);
    };
    UsersService.prototype.checkEmail = function (object) {
        return this.http.post('http://104.155.129.45:5000/user/checkemail', object.value);
    };
    UsersService.prototype.sendEmail = function (object) {
        return this.http.post('http://104.155.129.45:5000/user/checkemail', object.value);
    };
    UsersService.prototype.checkLogin = function (object) {
        return this.http.post('http://104.155.129.45:5000/user/checklogin', object.value);
    };
    UsersService.prototype.changePassword = function (object) {
        return this.http.post('http://104.155.129.45:5000/user/changepassword', object.value);
    };
    UsersService = __decorate([
        core_1.Injectable()
    ], UsersService);
    return UsersService;
}());
exports.UsersService = UsersService;
