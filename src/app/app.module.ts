/** Core imports */
import { ComponentFactoryResolver, NgModule } from '@angular/core';
import * as ngCommon from '@angular/common';

/** Third party modules */
import { TranslateModule } from '@ngx-translate/core';

/** Application imports */
import { LayoutModule } from './shared/layout/layout.module';
import { CommonModule } from '@shared/common/common.module';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { DashboardComponent } from '@app/main/dashboard/dashboard.component';
import { MemberSubscriptionServiceProxy } from '@shared/service-proxies/service-proxies';
import { AccessDeniedComponent } from './main/access-denied/access-denied.component';
import { AppService } from './app.service';
import {
    InstanceServiceProxy, ContactServiceProxy, BankAccountsServiceProxy,
    BusinessEntityServiceProxy, TenantSubscriptionServiceProxy, CashflowServiceProxy, CashFlowForecastServiceProxy
} from '@shared/service-proxies/service-proxies';

@NgModule({
    declarations: [
        DashboardComponent,
        AppComponent,
        AccessDeniedComponent
    ],
    imports: [
        ngCommon.CommonModule,
        CommonModule,
        AppRoutingModule,
        LayoutModule,
        TranslateModule.forChild({
            extend: true
        })
    ],
    providers: [
        AppService,
        InstanceServiceProxy,
        MemberSubscriptionServiceProxy,
        TenantSubscriptionServiceProxy
    ]
})
export class AppModule {}