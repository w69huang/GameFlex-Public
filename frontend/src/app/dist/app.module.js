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
var game_browser_component_1 = require("./game-browser/game-browser.component");
var animations_1 = require("@angular/platform-browser/animations");
var toolbar_1 = require("@angular/material/toolbar");
var icon_1 = require("@angular/material/icon");
var card_1 = require("@angular/material/card");
var button_1 = require("@angular/material/button");
var progress_bar_1 = require("@angular/material/progress-bar");
var file_list_component_1 = require("./file-list/file-list.component");
var file_uploader_component_1 = require("./file-uploader/file-uploader.component");
var form_field_1 = require("@angular/material/form-field");
var select_1 = require("@angular/material/select");
var game_browser_password_popup_component_1 = require("./popups/game-browser-password-popup/game-browser-password-popup.component");
var dummy_component_1 = require("./dummy/dummy.component");
var game_setup_popup_component_1 = require("./popups/game-setup-popup/game-setup-popup.component");
var signup_component_1 = require("./signup/signup.component");
var login_component_1 = require("./login/login.component");
var middleware_1 = require("./services/middleware");
var dialog_1 = require("@angular/material/dialog");
var changepassword_component_1 = require("./changepassword/changepassword.component");
var users_service_1 = require("./services/users.service");
var save_game_state_popup_component_1 = require("./popups/save-game-state-popup/save-game-state-popup.component");
var retrieve_game_state_popup_component_1 = require("./popups/retrieve-game-state-popup/retrieve-game-state-popup.component");
var ngx_mat_select_search_1 = require("ngx-mat-select-search");
var auth_guard_1 = require("./services/auth-guard");
var join_by_code_component_1 = require("./join-by-code/join-by-code.component");
var game_instance_component_1 = require("./game-instance/game-instance.component");
var load_game_state_popup_component_1 = require("./popups/load-game-state-popup/load-game-state-popup.component");
var upload_cards_popup_component_1 = require("./popups/create-deck-popup/upload-cards-popup.component");
var undo_game_state_popup_component_1 = require("./popups/undo-game-state-popup/undo-game-state-popup.component");
var create_counter_popup_component_1 = require("./popups/create-counter-popup/create-counter-popup.component");
var config_editor_component_1 = require("./config-editor/config-editor.component");
var save_configuration_popup_component_1 = require("./popups/save-configuration-popup/save-configuration-popup.component");
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
                file_list_component_1.FileListComponent,
                file_uploader_component_1.FileUploaderComponent,
                game_browser_component_1.GameBrowserComponent,
                game_browser_password_popup_component_1.GameBrowserPopupComponent,
                game_setup_popup_component_1.GameSetupPopupComponent,
                dummy_component_1.DummyComponent,
                signup_component_1.SignupComponent,
                login_component_1.LoginComponent,
                login_component_1.DialogForgotPassword,
                changepassword_component_1.ChangepasswordComponent,
                save_game_state_popup_component_1.SaveGameStatePopupComponent,
                retrieve_game_state_popup_component_1.RetrieveGameStatePopupComponent,
                join_by_code_component_1.JoinByCodeComponent,
                game_instance_component_1.GameInstanceComponent,
                create_counter_popup_component_1.CreateCounterPopupComponent,
                load_game_state_popup_component_1.LoadGameStatePopupComponent,
                undo_game_state_popup_component_1.UndoGameStatePopupComponent,
                config_editor_component_1.ConfigEditorComponent,
                save_configuration_popup_component_1.SaveConfigurationPopupComponent,
                upload_cards_popup_component_1.UploadCardsPopupComponent
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
                dialog_1.MatDialogModule,
                form_field_1.MatFormFieldModule,
                select_1.MatSelectModule,
                forms_1.FormsModule,
                forms_1.ReactiveFormsModule,
                ngx_mat_select_search_1.NgxMatSelectSearchModule
            ],
            entryComponents: [
                save_configuration_popup_component_1.SaveConfigurationPopupComponent,
                game_browser_password_popup_component_1.GameBrowserPopupComponent,
                game_setup_popup_component_1.GameSetupPopupComponent,
                save_game_state_popup_component_1.SaveGameStatePopupComponent,
                create_counter_popup_component_1.CreateCounterPopupComponent,
                retrieve_game_state_popup_component_1.RetrieveGameStatePopupComponent,
                load_game_state_popup_component_1.LoadGameStatePopupComponent,
                upload_cards_popup_component_1.UploadCardsPopupComponent,
                login_component_1.DialogForgotPassword
            ],
            providers: [
                middleware_1.MiddleWare,
                users_service_1.UsersService,
                auth_guard_1.AuthGuard
            ],
            bootstrap: [app_component_1.AppComponent]
        })
    ], AppModule);
    return AppModule;
}());
exports.AppModule = AppModule;
