/** Core imports */
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import * as ngCommon from '@angular/common';

/** Third party imports */
import { DxScrollViewModule } from 'devextreme-angular/ui/scroll-view';

/** Application imports */
import { CalendarService } from '@app/shared/common/calendar-button/calendar.service';
import { LoadingSpinnerModule } from '@app/shared/common/loading-spinner/loading-spinner.module';
import { CRMDashboardWidgetsModule } from '@shared/crm/dashboard-widgets/dashboard-widgets.module';
import { AppCommonModule } from '@app/shared/common/app-common.module';
import { CrmDashboardComponent } from '@app/crm/dashboard/dashboard.component';

@NgModule({
    imports: [
        FormsModule,
        RouterModule,
        DxScrollViewModule,
        ngCommon.CommonModule,
        CRMDashboardWidgetsModule,
        LoadingSpinnerModule,
        AppCommonModule
    ],
    declarations: [
        CrmDashboardComponent
    ],
    exports: [
        CrmDashboardComponent
    ],
    providers: [
        CalendarService
    ]
})
export class CrmModule {}
