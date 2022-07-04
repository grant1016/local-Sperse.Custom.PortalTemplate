/** Core imports */
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import * as ngCommon from '@angular/common';

/** Third party imports */
import { Store } from '@ngrx/store';
import { DxScrollViewModule } from 'devextreme-angular/ui/scroll-view';
import { DxDropDownBoxModule } from 'devextreme-angular/ui/drop-down-box';
import { DxSelectBoxModule } from 'devextreme-angular/ui/select-box';
import { DxDataGridModule } from 'devextreme-angular/ui/data-grid';
import { DxTextBoxModule } from 'devextreme-angular/ui/text-box';
import { DxListModule } from 'devextreme-angular/ui/list';
import { DxTooltipModule } from 'devextreme-angular/ui/tooltip';
import { ImageViewerModule } from 'ng2-image-viewer';

/** Application imports */
import { AppStore } from '@app/store';
import { AppPermissions } from '@shared/AppPermissions';
import { NoDataModule } from '@shared/common/widgets/no-data/no-data.module';
import { PhoneFormatModule } from '@shared/common/pipes/phone-format/phone-format.module';
import { StarsListComponent } from '@app/crm/shared/stars-list/stars-list.component';
import { ActionMenuModule } from '@app/shared/common/action-menu/action-menu.module';
import { CalendarService } from '@app/shared/common/calendar-button/calendar.service';
import { LoadingSpinnerModule } from '@app/shared/common/loading-spinner/loading-spinner.module';
import { CRMDashboardWidgetsModule } from '@shared/crm/dashboard-widgets/dashboard-widgets.module';
import { GhostListModule } from '@app/shared/common/ghost-list/ghost-list.module';
import { AppPermissionService } from '@shared/common/auth/permission.service';
import { AppCommonModule } from '@app/shared/common/app-common.module';
import { CrmDashboardComponent } from '@app/crm/dashboard/dashboard.component';
import { StaticListModule } from '@app/shared/common/static-list/static-list.module';
import { ListsModule } from '@app/shared/common/lists/lists.module';
import { AppStoreService } from '@app/store/app-store.service';
import { LeadsComponent } from './leads/leads.component';
import { PipelinesStoreActions } from '@app/store';
import { CountsAndTotalsModule } from '@shared/crm/dashboard-widgets/counts-and-totals/counts-and-totals.module';
import { TypesDropdownComponent } from '@app/crm/shared/types-dropdown/types-dropdown.component';
import { InvoicesComponent } from './invoices/invoices.component';

@NgModule({
    imports: [
        FormsModule,
        AppCommonModule,
        ListsModule,
        RouterModule,
        DxListModule,
        NoDataModule,
        GhostListModule,
        DxTextBoxModule,
        DxTooltipModule,
        DxDataGridModule,
        ActionMenuModule,
        DxSelectBoxModule,
        PhoneFormatModule,
        DxScrollViewModule,
        DxDropDownBoxModule,
        ngCommon.CommonModule,
        CRMDashboardWidgetsModule,
        LoadingSpinnerModule,
        StaticListModule,
        CountsAndTotalsModule,
        ImageViewerModule
    ],
    declarations: [
        LeadsComponent,
        StarsListComponent,
        CrmDashboardComponent,
        TypesDropdownComponent,
        InvoicesComponent
    ],
    exports: [
        LeadsComponent,
        CrmDashboardComponent
    ],
    providers: [
        CalendarService
    ]
})
export class CrmModule {
    constructor(
        private appStoreService: AppStoreService,
        private permissionService: AppPermissionService,
        private store$: Store<AppStore.State>
    ) {
        if (abp.session.userId && this.permissionService.isGranted(AppPermissions.CRM)) {
            setTimeout(() => this.appStoreService.loadUserDictionaries(), 2000);
            this.store$.dispatch(new PipelinesStoreActions.LoadRequestAction(false));
        }
    }
}