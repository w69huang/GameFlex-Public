"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.DialogForgotPassword = exports.LoginComponent = void 0;
var core_1 = require("@angular/core");
var LoginComponent = /** @class */ (function () {
    function LoginComponent(dialog, http, router, middleware, app, usersService) {
        this.dialog = dialog;
        this.http = http;
        this.router = router;
        this.middleware = middleware;
        this.app = app;
        this.usersService = usersService;
        this.failedLogin = false;
        this.blockLogin = false;
        this.username = "";
        this.password = "";
    }
    LoginComponent.prototype.ngOnInit = function () {
        this.checkLoggedIn();
    };
    LoginComponent.prototype.checkLoggedIn = function () {
        if (this.middleware.isLoggedIn()) {
            this.router.navigate(['/playspace']);
        }
    };
    LoginComponent.prototype.onSubmit = function (obj) {
        // NOTE: This code is to prevent login access if user fails to login 5 times.
        // if (parseInt(localStorage.getItem('failedLogin')) >= 5) {
        //   console.log("Banned From Login");
        // }
        var _this = this;
        if (obj.value.username != '' && obj.value.password != '') {
            this.usersService.checkLogin(obj)
                .subscribe(function (data) {
                if (data == true) {
                    // TO DO:
                    // 1. Reroute the user to the homepage. (For now let it be the playspace.) (Done)
                    // 2. Store the password in a global variable or a session type object. (Done thru middleware)
                    // 3. Create an indicator of them being logged in. (Done. Logout button appears and signup and loging are removed)
                    _this.middleware.setLoggedIn(true, obj.value.username, obj.value.password);
                    console.log("Login Status: " + _this.middleware.isLoggedIn());
                    _this.app.isLoggedIn = true;
                    _this.router.navigate(['/playspace']);
                }
                else {
                    // TO DO:
                    // 1. Reject their login attempt and keep them on the login page (Done)
                    // 2. Alert message saying their login info is wrong (dont specify which one) (Done)
                    // 3. Keep track of the number of login attempts. Lock them out after say 5 failed attempts (If time allows).
                    _this.middleware.setLoggedIn(false, '', '');
                    //This is for the lock out. 
                    // this.middleware.incFailedlogin();
                    _this.failedLogin = true;
                }
            });
        }
    };
    LoginComponent.prototype.openForgotPassword = function () {
        var dialogRef = this.dialog.open(DialogForgotPassword, {
            width: '250px'
        });
        dialogRef.afterClosed()
            .subscribe(function (result) {
            console.log("Close Dialog");
        });
    };
    LoginComponent = __decorate([
        core_1.Component({
            selector: 'app-login',
            templateUrl: './login.component.html',
            styleUrls: ['./login.component.scss']
        })
    ], LoginComponent);
    return LoginComponent;
}());
exports.LoginComponent = LoginComponent;
var DialogForgotPassword = /** @class */ (function () {
    function DialogForgotPassword(dialogRef, http, usersService) {
        this.dialogRef = dialogRef;
        this.http = http;
        this.usersService = usersService;
        this.emailExists = true;
    }
    DialogForgotPassword.prototype.onCancel = function () {
        this.dialogRef.close();
    };
    DialogForgotPassword.prototype.onSubmit = function (email) {
        var _this = this;
        // Do email stuff. Send this stuff and then send the person an email or something.
        this.usersService.checkEmail(email)
            .subscribe(function (responseData) {
            if (responseData instanceof Array) {
                if (responseData.length >= 1) {
                    _this.dialogRef.close();
                    _this.emailExists = true;
                    _this.usersService.sendEmail(email)
                        .subscribe(function (responseData) {
                        if (responseData == true) {
                            console.log("Email sent and password changed!");
                        }
                        else {
                            console.log("Email failed....");
                        }
                    });
                }
                else {
                    _this.emailExists = false;
                }
                // Send email
            }
            else {
                _this.emailExists = false;
            }
        });
    };
    DialogForgotPassword = __decorate([
        core_1.Component({
            selector: 'dialog_forgot_password',
            templateUrl: 'dialog_forgot_password.html'
        })
    ], DialogForgotPassword);
    return DialogForgotPassword;
}());
exports.DialogForgotPassword = DialogForgotPassword;
