import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from "@angular/common/http";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule} from '@angular/material/select';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TaskViewComponent } from './pages/task-view/task-view.component';
import { NewListComponent } from './pages/new-list/new-list.component';
import { NewTaskComponent } from './pages/new-task/new-task.component';
import { PlayspaceComponent } from './playspace/playspace.component';
import { DeckEditorComponent } from './deck-editor/deck-editor.component';
import { GameBrowserComponent } from './game-browser/game-browser.component';
import { FileListComponent } from './file-list/file-list.component';
import { GameBrowserPopupComponent } from './popups/game-browser-password-popup/game-browser-password-popup.component';
import { DummyComponent } from './dummy/dummy.component';
import { GameSetupPopupComponent } from './popups/game-setup-popup/game-setup-popup.component';
import { SignupComponent } from './signup/signup.component';
import { LoginComponent, DialogForgotPassword } from './login/login.component';
import { MiddleWare } from './services/middleware';
import { ChangepasswordComponent } from './changepassword/changepassword.component';
import { UsersService } from './services/users.service';
import { SaveGameStatePopupComponent } from './popups/save-game-state-popup/save-game-state-popup.component';
import { RetrieveGameStatePopupComponent } from './popups/retrieve-game-state-popup/retrieve-game-state-popup.component';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { AuthGuard } from './services/auth-guard';
import { JoinByCodeComponent } from './join-by-code/join-by-code.component';
import { GameInstanceComponent } from './game-instance/game-instance.component';
import { LoadGameStatePopupComponent } from './popups/load-game-state-popup/load-game-state-popup.component';
import { UploadCardsPopupComponent } from './popups/create-deck-popup/upload-cards-popup.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CardLargeThumbnailPopupComponent } from './popups/card-large-thumbnail-popup/card-large-thumbnail-popup.component';
import { UndoGameStatePopupComponent } from './popups/undo-game-state-popup/undo-game-state-popup.component';
import { CreateCounterPopupComponent } from './popups/create-counter-popup/create-counter-popup.component';
import { ConfigEditorComponent } from './config-editor/config-editor.component';
import { SaveConfigurationPopupComponent } from './popups/save-configuration-popup/save-configuration-popup.component';
import { LoadCardsPopupComponent } from './popups/load-cards-popup/load-cards-popup.component';
import { CounterComponent } from './counter/counter.component';
import { RetrieveConfigPopupComponent } from './popups/retrieve-config-popup/retrieve-config-popup.component';
import { WelcomeComponent } from './welcome/welcome.component';


@NgModule({
  declarations: [
    AppComponent,
    TaskViewComponent,
    NewListComponent,
    NewTaskComponent,
    PlayspaceComponent,
    DeckEditorComponent,
    FileListComponent,
    GameBrowserComponent,
    GameBrowserPopupComponent,
    GameSetupPopupComponent,
    DummyComponent,
    SignupComponent,
    LoginComponent,
    DialogForgotPassword,
    ChangepasswordComponent,
    SaveGameStatePopupComponent,
    RetrieveGameStatePopupComponent,
    JoinByCodeComponent,
    GameInstanceComponent,
    LoadGameStatePopupComponent,
    UploadCardsPopupComponent,
    CardLargeThumbnailPopupComponent,
    CreateCounterPopupComponent,
    LoadGameStatePopupComponent,
    UndoGameStatePopupComponent,
    ConfigEditorComponent,
    SaveConfigurationPopupComponent,
    UploadCardsPopupComponent,
    LoadCardsPopupComponent
    CounterComponent,
    RetrieveConfigPopupComponent,
    WelcomeComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MatToolbarModule,
    MatIconModule,
    MatCardModule,
    MatButtonModule,
    MatProgressBarModule,
    MatDialogModule,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    ReactiveFormsModule,
    NgxMatSelectSearchModule,
    FontAwesomeModule,
    CommonModule
  ],
  entryComponents: [
    LoadCardsPopupComponent,
    SaveConfigurationPopupComponent,
    GameBrowserPopupComponent,
    GameSetupPopupComponent,
    SaveGameStatePopupComponent,
    CreateCounterPopupComponent,
    RetrieveGameStatePopupComponent,
    LoadGameStatePopupComponent,
    UploadCardsPopupComponent,
    DialogForgotPassword,
    CardLargeThumbnailPopupComponent
  ],
  providers: [
    MiddleWare, 
    UsersService,
    AuthGuard
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
