import { NgModule } from '@angular/core';
import { RouteConfigLoadEnd, Router, RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { MemberPortalComponent } from './portal/member.portal.component';

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
                    },
                    
                ]
            },
            {
                path: 'member/:tenantId/:publicId',
                component: MemberPortalComponent,
                canActivate: [],
            },
            {
                path: 'member-portal',
                component: MemberPortalComponent,
                canActivate: [],
            }

        ])
    ],
    exports: [RouterModule],
    providers: []
})
export class PublicRoutingModule { }
