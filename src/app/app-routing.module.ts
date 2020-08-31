import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { DashboardComponent } from '@app/main/dashboard/dashboard.component';
import { CrmDashboardComponent } from '@app/crm/dashboard/dashboard.component';
import { RedirectGuard } from '@shared/common/redirect-guard/redirect-guard';
import { AppComponent } from './app.component';

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '',
                component: AppComponent,
                canActivate: [],
                canActivateChild: [],
                children: [
                    {
                        path: '',
                        redirectTo: 'dashboard',
                        pathMatch: 'full'
                    },
                    {
                        path: 'home',
                        component: DashboardComponent
                    },
                    {
                        path: 'dashboard',
                        component: CrmDashboardComponent
                    }
                ]
            }
        ])
    ],
    exports: [RouterModule],
    providers: [RedirectGuard]
})
export class AppRoutingModule { }