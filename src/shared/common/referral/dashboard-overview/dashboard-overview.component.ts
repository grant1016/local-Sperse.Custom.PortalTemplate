/** Core imports */
import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';

/** Third party imports */
import { map, first } from 'rxjs/operators';
import { ClipboardService } from 'ngx-clipboard';

/** Application imports */
import { AppPermissions } from '@shared/AppPermissions';
import { AppPermissionService } from '@shared/common/auth/permission.service';
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
    providers: [ SharingService ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardOverviewComponent {
    links$ = this.referralService.getLinks().pipe(map(links => {
        return links.map((link, index) => {
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
        private notifyService: NotifyService
    ) {
        this.accountSelectorService.selectedOrgUnitIds$.pipe(first()).subscribe(ids => {
            if (this.permission.isGranted(AppPermissions.CRMCustomers))
                dashboardService.setOrgUnitIdsForTotals(ids);
        });

        dashboardService.totalsData$.pipe(first()).subscribe(totalsData => {
            this.totalsData = totalsData;
            changeDetectorRef.detectChanges();            
        });

        this.referralService.ledgerTotals$.pipe(first()).subscribe(ledgerTotals => {
            this.ledgerTotals = ledgerTotals;
            this.changeDetectorRef.detectChanges();
        })

        dashboardService.refresh();
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
}