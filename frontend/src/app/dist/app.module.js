"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.AppModule = void 0;
var platform_browser_1 = require("@angular/platform-browser");
var core_1 = require("@angular/core");
var http_1 = require("@angular/common/http");
var forms_1 = require("@angular/forms");
var app_routing_module_1 = require("./app-routing.module");
var app_component_1 = require("./app.component");
var task_view_component_1 = require("./pages/task-view/task-view.component");
var new_list_component_1 = require("./pages/new-list/new-list.component");
var new_task_component_1 = require("./pages/new-task/new-task.component");
var playspace_component_1 = require("./playspace/playspace.component");
var deck_editor_component_1 = require("./deck-editor/deck-editor.component");
var animations_1 = require("@angular/platform-browser/animations");
var toolbar_1 = require("@angular/material/toolbar");
var icon_1 = require("@angular/material/icon");
var card_1 = require("@angular/material/card");
var button_1 = require("@angular/material/button");
var progress_bar_1 = require("@angular/material/progress-bar");
var dummy_component_1 = require("./dummy/dummy.component");
var signup_component_1 = require("./signup/signup.component");
var login_component_1 = require("./login/login.component");
var middleware_1 = require("./services/middleware");
var dialog_1 = require("@angular/material/dialog");
var AppModule = /** @class */ (function () {
    function AppModule() {
    }
    AppModule = __decorate([
        core_1.NgModule({
            declarations: [
                app_component_1.AppComponent,
                task_view_component_1.TaskViewComponent,
                new_list_component_1.NewListComponent,
                new_task_component_1.NewTaskComponent,
                playspace_component_1.PlayspaceComponent,
                deck_editor_component_1.DeckEditorComponent,
                dummy_component_1.DummyComponent,
                signup_component_1.SignupComponent,
                login_component_1.LoginComponent,
                login_component_1.DialogForgotPassword
            ],
            entryComponents: [
                login_component_1.DialogForgotPassword
            ],
            imports: [
                platform_browser_1.BrowserModule,
                app_routing_module_1.AppRoutingModule,
                http_1.HttpClientModule,
                animations_1.BrowserAnimationsModule,
                toolbar_1.MatToolbarModule,
                icon_1.MatIconModule,
                card_1.MatCardModule,
                button_1.MatButtonModule,
                progress_bar_1.MatProgressBarModule,
                forms_1.FormsModule,
                dialog_1.MatDialogModule
            ],
            providers: [middleware_1.MiddleWare],
            bootstrap: [app_component_1.AppComponent]
        })
    ], AppModule);
    return AppModule;
}());
exports.AppModule = AppModule;
