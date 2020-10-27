"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.ChangepasswordComponent = void 0;
var core_1 = require("@angular/core");
var ChangepasswordComponent = /** @class */ (function () {
    function ChangepasswordComponent(usersService, router) {
        this.usersService = usersService;
        this.router = router;
        this.passwordCorrect = null;
        this.passwordMatch = null;
    }
    ChangepasswordComponent.prototype.ngOnInit = function () {
    };
    ChangepasswordComponent.prototype.onSubmit = function (form) {
        var _this = this;
        console.log(form);
        // To do:
        // 1. Check password
        // 2. check new passwords match
        // 3. Submit new password
        // 4. Send success message. Don't reroute.
        if (localStorage.getItem("password") == form.value.previousPassword) {
            if (form.value.newPassword == form.value.confirmPassword) {
                form.value["username"] = localStorage.getItem("username");
                this.usersService.changePassword(form)
                    .subscribe(function (responseData) {
                    if (responseData == true) {
                        alert("Password Changed!");
                        _this.router.navigate(['/']);
                    }
                    else {
                        window.alert("Error");
                    }
                });
                this.passwordMatch = true;
            }
            else {
                this.passwordMatch = false;
            }
            this.passwordCorrect = true;
        }
        else {
            console.log("Password Incorrect.");
            this.passwordCorrect = false;
        }
    };
    ChangepasswordComponent = __decorate([
        core_1.Component({
            selector: 'app-changepassword',
            templateUrl: './changepassword.component.html',
            styleUrls: ['./changepassword.component.scss']
        })
    ], ChangepasswordComponent);
    return ChangepasswordComponent;
}());
exports.ChangepasswordComponent = ChangepasswordComponent;
