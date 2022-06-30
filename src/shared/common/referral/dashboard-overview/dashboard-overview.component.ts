/** Core imports */
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, AfterViewInit, OnDestroy } from '@angular/core';

/** Third party imports */
import { map, first, takeUntil } from 'rxjs/operators';
import { ClipboardService } from 'ngx-clipboard';

/** Application imports */
import { AppPermissions } from '@shared/AppPermissions';
import { AppPermissionService } from '@shared/common/auth/permission.service';
import { AppSessionService } from '@shared/common/session/app-session.service';
import { LifecycleSubjectsService } from '@shared/common/lifecycle-subjects/lifecycle-subjects.service';
import { AccountSelectorService } from '@app/shared/layout/account-selector/account-selector.service';
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
    selectInitialLink: any;
    links$ = this.referralService.getLinks().pipe(map(links => {
        return links.map((link, index) => {
            if (!index)
                this.selectInitialLink = link;
            link['index'] = index + 1;
            return link;
        });
    }));
    suggestedCopy: string;
    selectedLink: string;
    ledgerTotals: any;
    totalsData: any;

    constructor(
        public ls: AppLocalizationService,
        public permission: AppPermissionService,
        public accountSelectorService: AccountSelectorService,
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
        this.dashboardService.setOrgUnitIdsForTotals(undefined);
        this.dashboardService.setContactIdForTotals(
            this.appSessionService.user.contactId
        );
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

    ngOnDestroy() {
        this.lifeCycleSubject.deactivate.next();
    }
}