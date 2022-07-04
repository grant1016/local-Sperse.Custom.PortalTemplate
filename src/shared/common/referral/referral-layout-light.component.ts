/** Core imports */
import { ChangeDetectionStrategy, Component, ViewChild, OnInit } from '@angular/core';

/** Application imports */
import { LifecycleSubjectsService } from '@shared/common/lifecycle-subjects/lifecycle-subjects.service';
import { DashboardOverviewComponent } from './dashboard-overview/dashboard-overview.component';
import { ReferralLayoutBaseComponent } from './referral-layout-base.component';

@Component({
    selector: 'referral-layout-light',
    templateUrl: 'referral-layout-light.component.html',
    styleUrls: ['referral-layout-light.component.less'],
    providers: [LifecycleSubjectsService],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReferralLayoutLightComponent extends ReferralLayoutBaseComponent implements OnInit {
    @ViewChild(DashboardOverviewComponent) dashboard: DashboardOverviewComponent;

    getSelectedTabTitle() {
        switch (this.selectedTabIndex) {
            case this.DASHBOARD_TAB_INDEX:
                return 'OverviewTitle';
            case this.LINKS_TAB_INDEX:
                return 'LinkGenerator';
            case this.COMMISSIONS_TAB_INDEX:
                return 'CommissionHistoryTitle';
            case this.LEDGER_TAB_INDEX:
                return 'LedgerBalanceTitle';
        }
    }

    ngOnInit() {
        this.activate();
    }

    activate() {
        this.accountSelectorService.showAccountSelector.next(false);
        if (this.dashboard)
            this.dashboard.activate();
    }

    deactivate() {
        this.accountSelectorService.showAccountSelector.next(true);
        if (this.dashboard)
            this.dashboard.deactivate();
    }
}