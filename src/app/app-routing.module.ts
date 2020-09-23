/** Core imports */
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

/** Application imports */
import { AppConsts } from '@shared/AppConsts';
import { LeadsComponent } from '@app/crm/leads/leads.component';
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
                        path: 'leads',
                        component: LeadsComponent,
                        data: { localizationSource: AppConsts.localization.CRMLocalizationSourceName }
                    },        
                    {
                        path: 'dashboard',
                        component: CrmDashboardComponent,
                        data: { localizationSource: AppConsts.localization.CRMLocalizationSourceName }
                    },
                    {
                        path: 'referral',
                        loadChildren: () => import('shared/common/referral/referral.module').then(m => m.ReferralModule)
                    }
                ]
            }
        ])
    ],
    exports: [RouterModule],
    providers: [RedirectGuard]
})
export class AppRoutingModule { }