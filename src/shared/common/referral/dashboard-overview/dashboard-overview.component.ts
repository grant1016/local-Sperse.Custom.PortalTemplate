/** Core imports */
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, AfterViewInit, OnDestroy } from '@angular/core';

/** Third party imports */
import { of } from 'rxjs';
import { map, first, takeUntil } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { ClipboardService } from 'ngx-clipboard';

/** Application imports */
import { AppPermissions } from '@shared/AppPermissions';
import { AppPermissionService } from '@shared/common/auth/permission.service';
import { AppSessionService } from '@shared/common/session/app-session.service';
import { PayoutMethodDialogComponent } from '../shared/payout-method-dialog/payout-method-dialog.component';
import { LifecycleSubjectsService } from '@shared/common/lifecycle-subjects/lifecycle-subjects.service';
import { DashboardWidgetsService } from '@shared/crm/dashboard-widgets/dashboard-widgets.service';
import { AppLocalizationService } from '@app/shared/common/localization/app-localization.service';
import { ProfileService } from '@shared/common/profile-service/profile.service';
import { SharingService } from '@shared/common/sharing-service/sharing.service';
import { ReferralService } from '@shared/common/referral/referral.service';
import { NotifyService } from 'abp-ng2-module';

@Component({
    selector: 'dashboard-overview',
    templateUrl: 'dashboard-overview.component.html',
    styleUrls: [ 'dashboard-overview.component.less' ],
    providers: [ SharingService, LifecycleSubjectsService ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardOverviewComponent implements AfterViewInit, OnDestroy {
    isCRMEnabled = this.permission.isGranted(AppPermissions.CRM);
    isCRMCustomersEnabled = this.permission.isGranted(AppPermissions.CRMCustomers);

    selectInitialLink: any;
    links$ = this.isCRMEnabled ? this.referralService.getLinks().pipe(map(links => {
        return links.map((link, index) => {
            if (!index)
                this.selectInitialLink = link;
            link['index'] = index + 1;
            return link;
        });
    })) : of([]);
    suggestedCopy: string;
    selectedLink: string;
    ledgerTotals: any;
    totalsData: any;

    constructor(
        public dialog: MatDialog,
        public ls: AppLocalizationService,
        public permission: AppPermissionService,
        public dashboardService: DashboardWidgetsService,
        public changeDetectorRef: ChangeDetectorRef,
        public referralService: ReferralService,
        private clipboardService: ClipboardService,
        private profileService: ProfileService,
        private sharingService: SharingService,
        private notifyService: NotifyService,
        private appSessionService: AppSessionService,
        private lifeCycleSubject: LifecycleSubjectsService
    ) {
        this.refresh();
    }

    ngAfterViewInit() {
        if (this.isCRMCustomersEnabled)
            this.dashboardService.totalsData$.pipe(
                takeUntil(this.lifeCycleSubject.deactivate$)
            ).subscribe(totalsData => {
                this.totalsData = totalsData;
                this.changeDetectorRef.detectChanges();            
            });

        this.referralService.ledgerTotals$.pipe(
            takeUntil(this.lifeCycleSubject.deactivate$)
        ).subscribe(ledgerTotals => {
            this.ledgerTotals = ledgerTotals;
            this.changeDetectorRef.detectChanges();
        });
    }

    refresh() {
        if (this.isCRMCustomersEnabled) {
            this.dashboardService.setOrgUnitIdsForTotals(undefined);
            this.dashboardService.setContactIdForTotals(
                this.appSessionService.user.contactId
            );
        }
    }

    onSelectedLinkChanged(event) {
        this.profileService.accessCode$.pipe(first()).subscribe(accessCode => {
            this.suggestedCopy = event.value.suggestedCopy;
            this.selectedLink = event.value.url + (accessCode ? 
                (event.value.url.includes('?') ? '&' : '?') + 'ref=' + accessCode : ''
            );                
        });
    }

    copyLink() {
        this.clipboardService.copyFromContent(this.selectedLink);
        this.notifyService.info(this.ls.l('SavedToClipboard'));
    }

    showPayoutMethodDialog() {
        this.dialog.open(PayoutMethodDialogComponent, {
            width: '420px'
        });
    }

    activate() {
        this.refresh();
    }

    deactivate() {
        this.lifeCycleSubject.deactivate.next();
    }

    ngOnDestroy() {
        this.deactivate();
    }
}