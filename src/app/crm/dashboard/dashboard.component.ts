/** Core imports */
import {
    Component,
    AfterViewInit,
    ViewChild,
    ChangeDetectorRef,
    HostListener
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

/** Third party imports */
import DataSource from 'devextreme/data/data_source';
import { DxDropDownBoxComponent } from 'devextreme-angular/ui/drop-down-box';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { filter, first, takeUntil } from 'rxjs/operators';

/** Application imports */
import { AppConsts } from '@shared/AppConsts';
import { AppService } from '@app/app.service';
import { AppPermissions } from '@shared/AppPermissions';
import { AppPermissionService } from '@shared/common/auth/permission.service';
import { AppUiCustomizationService } from '@shared/common/ui/app-ui-customization.service';
import { AppLocalizationService } from '@app/shared/common/localization/app-localization.service';
import { AppSessionService } from '@shared/common/session/app-session.service';
import { DashboardServiceProxy, GetTotalsOutput } from '@shared/service-proxies/service-proxies';
import { DashboardWidgetsService } from '@shared/crm/dashboard-widgets/dashboard-widgets.service';
import { TotalsBySourceComponent } from '@shared/crm/dashboard-widgets/totals-by-source/totals-by-source.component';
import { ClientsByRegionComponent } from '@shared/crm/dashboard-widgets/clients-by-region/clients-by-region.component';
import { LifecycleSubjectsService } from '@shared/common/lifecycle-subjects/lifecycle-subjects.service';
import { PeriodService } from '@app/shared/common/period/period.service';
import { TotalsDataField } from '@shared/crm/dashboard-widgets/counts-and-totals/totals-data-field.interface';
import { AccountSelectorService } from '@app/shared/layout/account-selector/account-selector.service';

@Component({
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.less'],
    providers: [ LifecycleSubjectsService ]
})
export class CrmDashboardComponent implements AfterViewInit {
    @ViewChild(DxDropDownBoxComponent) dropDown: DxDropDownBoxComponent;
    @ViewChild(ClientsByRegionComponent) clientsByRegion: ClientsByRegionComponent;
    @ViewChild(TotalsBySourceComponent) totalsBySource: TotalsBySourceComponent;
    search: string;
    searchTimeout: any;
    dialogConfig = new MatDialogConfig();
    isGrantedCustomers = this.permission.isGranted(AppPermissions.CRMCustomers);
    isGrantedOrders = this.permission.isGranted(AppPermissions.CRMOrders);
    hasCustomersPermission: boolean = this.permission.isGranted(AppPermissions.CRMCustomers);
    hasOrdersPermission: boolean = this.permission.isGranted(AppPermissions.CRMOrders);
    hasPermissionToAddClient: boolean = this.permission.isGranted(AppPermissions.CRMCustomersManage);
    localization = AppConsts.localization.CRMLocalizationSourceName;
    contactsDataSource: DataSource;
    totalsData$: Observable<GetTotalsOutput> = this.dashboardWidgetsService.totalsData$;
    totalsDataFields: TotalsDataField[] = this.dashboardWidgetsService.totalsDataFields;

    @HostListener('window:resize') onResize() {
        this.repaint();
    }

    constructor(
        private router: Router,
        private appService: AppService,
        private appSessionService: AppSessionService,
        private dashboardWidgetsService: DashboardWidgetsService,
        private changeDetectorRef: ChangeDetectorRef,
        private periodService: PeriodService,
        private lifeCycleSubject: LifecycleSubjectsService,
        private dashboardServiceProxy: DashboardServiceProxy,
        private activatedRoute: ActivatedRoute,
        public ui: AppUiCustomizationService,
        public permission: AppPermissionService,
        public ls: AppLocalizationService,
        public dialog: MatDialog,
        public accountSelectorService: AccountSelectorService
    ) {
        this.accountSelectorService.selectedOrgUnitIds$.pipe(
            takeUntil(this.lifeCycleSubject.deactivate$)
        ).subscribe(ids => {
            if (this.permission.isGranted(AppPermissions.CRMCustomers)) {
                this.dashboardWidgetsService.setOrgUnitIdsForTotals(ids);
                this.dashboardWidgetsService.setContactIdForTotals(undefined);
            }
        });
    }    

    ngAfterViewInit(): void {
        this.activate();
    }

    refresh() {
        this.dashboardWidgetsService.refresh();
    }

    addClient() {
        this.router.navigate(['app/crm/clients'], { queryParams: { action: 'addNew' } });
    }

    activate() {
        this.lifeCycleSubject.activate.next();
        this.subscribeToRefreshParam();
        this.refreshClientsByRegion();
        this.refreshTotalsBySource();
        this.changeDetectorRef.detectChanges();
    }

    subscribeToRefreshParam() {
        this.activatedRoute.queryParams
            .pipe(
                takeUntil(this.lifeCycleSubject.deactivate$),
                filter(params => !!params['refresh'])
            )
            .subscribe(() => this.refresh() );
    }

    repaint() {
        this.refreshClientsByRegion();
        this.refreshTotalsBySource();
    }

    private refreshClientsByRegion() {
        let vectorComponent = this.clientsByRegion && this.clientsByRegion.mapComponent 
            && this.clientsByRegion.mapComponent.vectorMapComponent;
        if (vectorComponent)
            setTimeout(() => vectorComponent.instance.render());
    }

    private refreshTotalsBySource() {
        if (this.totalsBySource && this.totalsBySource.chartComponent)
            setTimeout(() => this.totalsBySource.chartComponent.instance.refresh());
    }

    invalidate() {
        this.lifeCycleSubject.activate$.pipe(first()).subscribe(() => {
            this.refresh();
        });
    }

    deactivate() {
        this.lifeCycleSubject.deactivate.next();
    }
}