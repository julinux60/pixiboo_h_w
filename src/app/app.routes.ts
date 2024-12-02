import { Routes } from '@angular/router';
import { NotfounderrorComponent } from './notfounderror/notfounderror.component';
import { EditorComponent } from './editor/editor.component';

export const routes: Routes = [
    { path: 'home', component: EditorComponent },
    { path: '',   redirectTo: '/home', pathMatch: 'full' },
    { path: '**', component: NotfounderrorComponent },
];
