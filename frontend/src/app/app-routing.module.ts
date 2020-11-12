import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TaskViewComponent } from './pages/task-view/task-view.component';
import { NewListComponent } from './pages/new-list/new-list.component';
import { NewTaskComponent } from './pages/new-task/new-task.component';
import { PlayspaceComponent } from './playspace/playspace.component';
import { DeckEditorComponent } from './deck-editor/deck-editor.component';
<<<<<<< HEAD
import { FileListComponent } from './file-list/file-list.component';


const routes: Routes = [
  { path: '', redirectTo: 'playspace', pathMatch: 'full' },
  { path: 'playspace', component: PlayspaceComponent},
  { path: 'deckeditor', component: DeckEditorComponent, 
  children: [
    { path: '', component: FileListComponent, outlet: 'secondary' }
    ]
  },
=======
import { GameBrowserComponent } from './game-browser/game-browser.component';
import { DummyComponent } from './dummy/dummy.component';
import { SignupComponent } from './signup/signup.component';
import { LoginComponent } from './login/login.component';
import { ChangepasswordComponent } from './changepassword/changepassword.component';
import { JoinByCodeComponent } from './join-by-code/join-by-code.component';


const routes: Routes = [
  { path: '', redirectTo: 'joinByCode', pathMatch: 'full' },
  { path: 'playspace', component: PlayspaceComponent },
  { path: 'deckEditor', component: DeckEditorComponent },
  { path: 'gameBrowser', component: GameBrowserComponent },
  { path: 'joinByCode', component: JoinByCodeComponent },
  
  { path: 'dummy', component: DummyComponent},
  { path: 'signup', component: SignupComponent},
  { path: 'login', component: LoginComponent},
  { path: 'changepassword', component: ChangepasswordComponent },

>>>>>>> develop
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
