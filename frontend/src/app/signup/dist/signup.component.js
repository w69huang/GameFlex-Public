"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.SignupComponent = void 0;
var core_1 = require("@angular/core");
var rxjs_1 = require("rxjs");
var SignupComponent = /** @class */ (function () {
    function SignupComponent(http, router, usersService) {
        this.http = http;
        this.router = router;
        this.usersService = usersService;
        this.username = "";
        this.password = "";
        this.confirmPassword = "";
        this.email = "";
        this.userExists = false;
        this.emailExists = false;
        this.passwordMatch = true;
    }
    SignupComponent.prototype.ngOnInit = function () {
    };
    SignupComponent.prototype.onSubmit = function (obj) {
        var _this = this;
        // Does SQL checks to confirm if a username exists or an email address is in use;
        if (obj.value.password != obj.value.confirmPassword) {
            this.passwordMatch = false;
            return null;
        }
        else {
            this.passwordMatch = true;
        }
        if (obj.value.username != '' && obj.value.email != '') {
            rxjs_1.forkJoin(this.usersService.getUser(obj), this.usersService.checkEmail(obj)).subscribe(function (data) {
                if (data instanceof Array && data[0] instanceof Array && data[1] instanceof Array) {
                    if (data[0].length >= 1) {
                        _this.userExists = true;
                    }
                    else {
                        _this.userExists = false;
                    }
                    if (data[1].length >= 1) {
                        _this.emailExists = true;
                    }
                    else {
                        _this.emailExists = false;
                    }
                }
                else {
                    console.log("Failed to either send data or SQL failed.");
                }
                if (!_this.userExists && !_this.emailExists) {
                    _this.onRegister(obj);
                }
            });
        }
    };
    ;
    SignupComponent.prototype.onRegister = function (obj) {
        var _this = this;
        // Confirms the SQL check and creates a new user into the sql table
        obj.value['userID'] = this.hash(obj.value.username);
        this.usersService.createUser(obj)
            .subscribe(function (responseData) {
            _this.router.navigate(['/login']);
        });
    };
    SignupComponent.prototype.hash = function (string) {
        var i, char;
        var hash = 0;
        for (i = 0; i < string.length; i++) {
            char = string.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        if (hash < 0) {
            hash = hash * -1;
        }
        return hash;
    };
    SignupComponent = __decorate([
        core_1.Component({
            selector: 'app-signup',
            templateUrl: './signup.component.html',
            styleUrls: ['./signup.component.scss']
        })
    ], SignupComponent);
    return SignupComponent;
}());
exports.SignupComponent = SignupComponent;
