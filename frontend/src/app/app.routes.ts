import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { TestComponent } from './pages/test/test.component';

export const routes: Routes = [
    {
        path:'', pathMatch:'full', redirectTo:'Home'
    },
    {
        path:'Home', component:HomeComponent
    },
    {
        path:'Test', component:TestComponent
    }
];
