/** Core imports */
import { ComponentFactoryResolver, NgModule } from '@angular/core';
import * as ngCommon from '@angular/common';

/** Third party modules */
import { TranslateModule } from '@ngx-translate/core';

/** Application imports */
import { AppStoreModule } from '@app/store/app-store.module';
import { LayoutModule } from './shared/layout/layout.module';
import { CommonModule } from '@shared/common/common.module';
import { MapModule } from '@app/shared/common/slice/map/map.module';
import { CrmModule } from '@app/crm/crm.module';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { DashboardComponent } from '@app/main/dashboard/dashboard.component';
import { MemberSubscriptionServiceProxy } from '@shared/service-proxies/service-proxies';
import { AccessDeniedComponent } from './main/access-denied/access-denied.component';
import { ExportGoogleSheetService } from '@shared/common/export/export-google-sheets/export-google-sheets';
import { ExportService } from '@shared/common/export/export.service';
import { AppService } from './app.service';
import {
    InstanceServiceProxy, ContactServiceProxy, BankAccountsServiceProxy,
    BusinessEntityServiceProxy, TenantSubscriptionServiceProxy, CashflowServiceProxy, CashFlowForecastServiceProxy
} from '@shared/service-proxies/service-proxies';

@NgModule({
    declarations: [
        AppComponent,
        DashboardComponent,
        AccessDeniedComponent
    ],
    imports: [
        ngCommon.CommonModule,
        LayoutModule,
        CommonModule,
        MapModule,
        CrmModule,
        AppRoutingModule,
        AppStoreModule,
        TranslateModule.forChild({
            extend: true
        })
    ],
    providers: [
        AppService,
        ExportService,
        InstanceServiceProxy,
        ExportGoogleSheetService,
        MemberSubscriptionServiceProxy,
        TenantSubscriptionServiceProxy
    ]
})
export class AppModule {}