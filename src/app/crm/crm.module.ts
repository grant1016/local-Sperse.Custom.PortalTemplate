/** Core imports */
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import * as ngCommon from '@angular/common';

/** Third party imports */
import { Store } from '@ngrx/store';
import { DxScrollViewModule } from 'devextreme-angular/ui/scroll-view';
import { DxDropDownBoxModule } from 'devextreme-angular/ui/drop-down-box';
import { DxTextBoxModule } from 'devextreme-angular/ui/text-box';
import { DxListModule } from 'devextreme-angular/ui/list';

/** Application imports */
import { AppStore } from '@app/store';
import { AppPermissions } from '@shared/AppPermissions';
import { CalendarService } from '@app/shared/common/calendar-button/calendar.service';
import { LoadingSpinnerModule } from '@app/shared/common/loading-spinner/loading-spinner.module';
import { CRMDashboardWidgetsModule } from '@shared/crm/dashboard-widgets/dashboard-widgets.module';
import { AppPermissionService } from '@shared/common/auth/permission.service';
import { AppCommonModule } from '@app/shared/common/app-common.module';
import { CrmDashboardComponent } from '@app/crm/dashboard/dashboard.component';
import { PipelinesStoreActions } from '@app/store';

@NgModule({
    imports: [
        FormsModule,
        RouterModule,
        DxListModule,
        DxTextBoxModule,
        DxScrollViewModule,
        DxDropDownBoxModule,
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
export class CrmModule {
    constructor(
        private permissionService: AppPermissionService,
        private store$: Store<AppStore.State>
    ) {
        if (abp.session.userId && this.permissionService.isGranted(AppPermissions.CRM))
            this.store$.dispatch(new PipelinesStoreActions.LoadRequestAction(false));
    }
}
