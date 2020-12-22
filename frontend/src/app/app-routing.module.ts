import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TaskViewComponent } from './pages/task-view/task-view.component';
import { NewListComponent } from './pages/new-list/new-list.component';
import { NewTaskComponent } from './pages/new-task/new-task.component';
import { PlayspaceComponent } from './playspace/playspace.component';
import { DeckEditorComponent } from './deck-editor/deck-editor.component';
import { ConfigEditorComponent } from './config-editor/config-editor.component';
import { GameBrowserComponent } from './game-browser/game-browser.component';
import { DummyComponent } from './dummy/dummy.component';
import { SignupComponent } from './signup/signup.component';
import { LoginComponent } from './login/login.component';
import { ChangepasswordComponent } from './changepassword/changepassword.component';
import { AuthGuard } from './services/auth-guard';
import { JoinByCodeComponent } from './join-by-code/join-by-code.component';
import { GameInstanceComponent } from './game-instance/game-instance.component';


const routes: Routes = [
<<<<<<< HEAD
  { path: '', redirectTo: 'joinByCode', pathMatch: 'full' },
  { path: 'gameInstance', component: GameInstanceComponent },
  { path: 'deckEditor', component: DeckEditorComponent },
  { path: 'gameBrowser', component: GameBrowserComponent },
  { path: 'joinByCode', component: JoinByCodeComponent },
=======
  { path: '', redirectTo: 'gameBrowser', pathMatch: 'full' },
  { path: 'playspace', component: PlayspaceComponent, canActivate:[AuthGuard] },
  { path: 'deckEditor', component: DeckEditorComponent, canActivate:[AuthGuard] },
  { path: 'configeditor', component: ConfigEditorComponent, canActivate:[AuthGuard] },
  { path: 'gameBrowser', component: GameBrowserComponent, canActivate:[AuthGuard] },
  { path: 'joinByCode', component: JoinByCodeComponent, canActivate:[AuthGuard] },
>>>>>>> develop
  
  { path: 'dummy', component: DummyComponent},
  { path: 'signup', component: SignupComponent,canActivate:[AuthGuard] },
  { path: 'login', component: LoginComponent,canActivate:[AuthGuard] },
  { path: 'changepassword', component: ChangepasswordComponent,canActivate:[AuthGuard] },

  { path: 'lists', component: TaskViewComponent },
  { path: 'lists/:listId', component: TaskViewComponent },
  { path: 'new-list', component: NewListComponent },
  { path: 'lists/:listId/new-task', component: NewTaskComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
