import { NgModule } from '@angular/core';
import { RouteConfigLoadEnd, Router, RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '',
                component: HomeComponent,
                canActivate: [],
                canActivateChild: [],
                children: [
                    {
                        path: '',
                        redirectTo: 'home',
                        pathMatch: 'full'
                    },
                    {
                        path: 'home',
                        component: HomeComponent
                    }
                ]
            }
        ])
    ],
    exports: [RouterModule],
    providers: []
})
export class PublicRoutingModule { }
