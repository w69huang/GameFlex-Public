"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.AppRoutingModule = void 0;
var core_1 = require("@angular/core");
var router_1 = require("@angular/router");
var task_view_component_1 = require("./pages/task-view/task-view.component");
var new_list_component_1 = require("./pages/new-list/new-list.component");
var new_task_component_1 = require("./pages/new-task/new-task.component");
var playspace_component_1 = require("./playspace/playspace.component");
var deck_editor_component_1 = require("./deck-editor/deck-editor.component");
var dummy_component_1 = require("./dummy/dummy.component");
var signup_component_1 = require("./signup/signup.component");
var login_component_1 = require("./login/login.component");
var changepassword_component_1 = require("./changepassword/changepassword.component");
var routes = [
    { path: '', redirectTo: 'playspace', pathMatch: 'full' },
    { path: 'playspace', component: playspace_component_1.PlayspaceComponent },
    { path: 'deckeditor', component: deck_editor_component_1.DeckEditorComponent },
    { path: 'dummy', component: dummy_component_1.DummyComponent },
    { path: 'signup', component: signup_component_1.SignupComponent },
    { path: 'login', component: login_component_1.LoginComponent },
    { path: 'changepassword', component: changepassword_component_1.ChangepasswordComponent },
    { path: 'lists', component: task_view_component_1.TaskViewComponent },
    { path: 'lists/:listId', component: task_view_component_1.TaskViewComponent },
    { path: 'new-list', component: new_list_component_1.NewListComponent },
    { path: 'lists/:listId/new-task', component: new_task_component_1.NewTaskComponent }
];
var AppRoutingModule = /** @class */ (function () {
    function AppRoutingModule() {
    }
    AppRoutingModule = __decorate([
        core_1.NgModule({
            imports: [router_1.RouterModule.forRoot(routes)],
            exports: [router_1.RouterModule]
        })
    ], AppRoutingModule);
    return AppRoutingModule;
}());
exports.AppRoutingModule = AppRoutingModule;
