import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';

export const routes: Routes = [
    {
        path:'', pathMatch:'full', redirectTo:'Home'
    },
    {
        path:'Home', component:HomeComponent
    }
];
