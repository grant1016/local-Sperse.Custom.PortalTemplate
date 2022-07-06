/** Core imports */
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

/** Application imports */
import { AppConsts } from '@shared/AppConsts';
import { LeadsComponent } from '@app/crm/leads/leads.component';
import { InvoicesComponent } from '@app/crm/invoices/invoices.component';
import { DashboardComponent } from '@app/main/dashboard/dashboard.component';
import { CrmDashboardComponent } from '@app/crm/dashboard/dashboard.component';
import { RedirectGuard } from '@shared/common/redirect-guard/redirect-guard';
import { LocalizationResolver } from '@shared/common/localization-resolver';
import { AppFeatures } from '@shared/AppFeatures';
import { AppComponent } from './app.component';

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '',
                component: AppComponent,
                canActivate: [],
                canActivateChild: [LocalizationResolver],
                children: [
                    {
                        path: '',
                        redirectTo: 'dashboard',
                        pathMatch: 'full'
                    },
                    {
                        path: 'home',
                        component: DashboardComponent,
                        data: {feature: AppFeatures.PortalDashboard}    
                    },
                    {
                        path: 'leads',
                        component: LeadsComponent,
                        data: {feature: AppFeatures.PortalLeads, localizationSource: AppConsts.localization.CRMLocalizationSourceName }
                    },        
                    {
                        path: 'dashboard',
                        component: CrmDashboardComponent,
                        data: {feature: AppFeatures.PortalDashboard, reuse: true, localizationSource: AppConsts.localization.CRMLocalizationSourceName }
                    },
                    {
                        path: 'invoices',
                        component: InvoicesComponent,
                        data: {feature: AppFeatures.PortalInvoices, localizationSource: AppConsts.localization.CRMLocalizationSourceName }
                    },
                    {
                        path: 'reseller-info',
                        loadChildren: () => import('shared/common/referral/referral.module').then(m => m.ReferralModule),
                        data: {feature: AppFeatures.PortalReseller}    
                    }
                ]
            }
        ])
    ],
    exports: [RouterModule],
    providers: [RedirectGuard]
})
export class AppRoutingModule { }