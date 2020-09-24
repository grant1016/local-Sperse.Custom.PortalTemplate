import { ChangeDetectionStrategy, Component, ViewChild } from '@angular/core';
import { TotalsDataField } from '@shared/crm/dashboard-widgets/counts-and-totals/totals-data-field.interface';
import { LayoutService } from '@app/shared/layout/layout.service';
import { Observable } from '@node_modules/rxjs';
import { GetTotalsOutput } from '@shared/service-proxies/service-proxies';
import { DashboardWidgetsService } from '@shared/crm/dashboard-widgets/dashboard-widgets.service';
import { AppLocalizationService } from '@app/shared/common/localization/app-localization.service';
import { BalanceValue } from '@shared/common/referral/ledger-balance/balance-value.interface';
import { DxValidatorComponent } from '@node_modules/devextreme-angular';
import { NotifyService } from '@abp/notify/notify.service';

@Component({
    selector: 'ledger-balance',
    templateUrl: 'ledger-balance.component.html',
    styleUrls: [ 'ledger-balance.component.less' ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LedgerBalanceComponent {
    @ViewChild(DxValidatorComponent, { static: false }) validator: DxValidatorComponent;
    totalsDataFields: TotalsDataField[] = [
        {
            title: 'Sales',
            color: this.layoutService.getLayoutColor('totalSales'),
            name: 'totalOrderAmount',
            type: 'currency',
            percent:  '0%',
            visible: true,
            estimated: '10%'
        }, {
            title: 'Referrals',
            color: this.layoutService.getLayoutColor('totalLeads'),
            name: 'totalLeadCount',
            type: 'number',
            percent: '0%',
            visible: true,
            estimated: '10%'
        }, {
            title: 'Homeowners',
            color: this.layoutService.getLayoutColor('totalClients'),
            name: 'totalClientCount',
            type: 'number',
            percent: '0%',
            visible: true,
            estimated: '10%'
        }
    ];
    totalsData$: Observable<GetTotalsOutput> = this.dashboardWidgetsService.totalsData$;
    balancesValues: BalanceValue[] = [
        {
            name: 'Earned',
            value: 131277
        },
        {
            name: 'Withdrawals',
            value: -8
        },
        {
            name: 'Pending',
            value: -8
        },
        {
            name: 'Posted',
            value: 131277
        },
        {
            name: 'Requests',
            value: 0
        },
        {
            name: 'Available',
            value: 131277
        }
    ];
    withdrawalAmount = null;

    constructor(
        private layoutService: LayoutService,
        private dashboardWidgetsService: DashboardWidgetsService,
        private notifyService: NotifyService,
        public ls: AppLocalizationService
    ) {}

    save() {
        if (this.validator.instance.validate().isValid) {
            this.notifyService.success(this.ls.l('Thanks for you request'));
        }
    }

    reset() {
        this.withdrawalAmount = null;
    }
}