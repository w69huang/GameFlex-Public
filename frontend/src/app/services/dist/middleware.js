"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.MiddleWare = void 0;
var core_1 = require("@angular/core");
var MiddleWare = /** @class */ (function () {
    function MiddleWare() {
        this.loggedInStatus = JSON.parse(localStorage.getItem('loggedIn') || 'false');
        this.failedAttemps = parseInt(JSON.parse(localStorage.getItem('failedLogin') || '0'));
    }
    MiddleWare.prototype.setLoggedIn = function (value, username, password) {
        this.loggedInStatus = value;
        if (value == true) {
            localStorage.setItem('loggedIn', 'true');
            localStorage.setItem('username', username);
            localStorage.setItem('password', password);
        }
        else {
            localStorage.setItem('loggedIn', 'false');
            localStorage.setItem('username', '');
            localStorage.setItem('password', '');
        }
    };
    MiddleWare.prototype.incFailedlogin = function () {
        var current = parseInt(JSON.parse(localStorage.getItem('failedLogin')));
        current = current + 1;
        localStorage.setItem('failedLogin', current.toString());
        return current;
    };
    MiddleWare.prototype.clearFailedLogin = function () {
        localStorage.setItem('failedLogin', '0');
        return "cleared";
    };
    MiddleWare.prototype.isLoggedIn = function () {
        return JSON.parse(localStorage.getItem('loggedIn') || this.loggedInStatus.toString());
    };
    MiddleWare.prototype.getUserDetails = function (username, password) {
        //Get a specific user's data. Is this needed? Maybe. 
        return "to do";
    };
    MiddleWare = __decorate([
        core_1.Injectable()
    ], MiddleWare);
    return MiddleWare;
}());
exports.MiddleWare = MiddleWare;
