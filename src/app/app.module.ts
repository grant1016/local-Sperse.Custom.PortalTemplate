/** Core imports */
import { ComponentFactoryResolver, NgModule } from '@angular/core';
import * as ngCommon from '@angular/common';

/** Third party modules */
import { TranslateModule } from '@ngx-translate/core';

/** Application imports */
import { AppStoreModule } from '@app/store/app-store.module';
import { LayoutModule } from './shared/layout/layout.module';
import { CommonModule } from '@shared/common/common.module';
import { FiltersModule } from '@shared/filters/filters.module';
import { MapModule } from '@app/shared/common/slice/map/map.module';
import { CrmModule } from '@app/crm/crm.module';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { DashboardComponent } from '@app/main/dashboard/dashboard.component';
import { MemberSubscriptionServiceProxy } from '@shared/service-proxies/service-proxies';
import { ExportGoogleSheetService } from '@shared/common/export/export-google-sheets/export-google-sheets';
import { ExportService } from '@shared/common/export/export.service';
import { AppStoreService } from '@app/store/app-store.service';
import { AppService } from './app.service';
import { InstanceServiceProxy, TenantSubscriptionServiceProxy } from '@shared/service-proxies/service-proxies';

@NgModule({
    declarations: [
        AppComponent,
        DashboardComponent
    ],
    imports: [
        ngCommon.CommonModule,
        AppStoreModule,
        LayoutModule,
        CommonModule,
        MapModule,
        CrmModule,
        AppRoutingModule,
        FiltersModule.forRoot(),
        TranslateModule.forChild({
            extend: true
        })
    ],
    providers: [
        AppService,
        ExportService,
        AppStoreService,
        InstanceServiceProxy,
        ExportGoogleSheetService,
        MemberSubscriptionServiceProxy,
        TenantSubscriptionServiceProxy
    ]
})
export class AppModule {}