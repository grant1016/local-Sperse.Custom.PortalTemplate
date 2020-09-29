import { ChangeDetectionStrategy, Component, ViewChild } from '@angular/core';
import { LayoutService } from '@app/shared/layout/layout.service';
import { DashboardWidgetsService } from '@shared/crm/dashboard-widgets/dashboard-widgets.service';
import { AppLocalizationService } from '@app/shared/common/localization/app-localization.service';
import { DxValidatorComponent } from '@node_modules/devextreme-angular';
import { NotifyService } from '@abp/notify/notify.service';

@Component({
    selector: 'ledger-balance',
    templateUrl: 'ledger-balance.component.html',
    styleUrls: [
        '../shared/styles/header.less',
        '../shared/styles/data-grid.less',
        'ledger-balance.component.less'
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LedgerBalanceComponent {
    @ViewChild(DxValidatorComponent, { static: false }) validator: DxValidatorComponent;
    withdrawalAmount = null;
    pendingTransactions = [
        {
            date: '12/11/2020',
            name: 'Withdrawal Request',
            status: 'Pending',
            earningAmount: null,
            withdrawalAmount: -30000,
            balance: null
        },
        {
            date: '12/10/2020',
            name: 'Withdrawal Request',
            status: 'Pending',
            earningAmount: null,
            withdrawalAmount: -2500,
            balance: null
        } ,
        {
            date: '12/01/2020',
            name: 'Earnings 11/22-11/29',
            status: 'Pending',
            earningAmount: 2500,
            withdrawalAmount: null,
            balance: null
        }
    ];
    transactions = [
        {"date":"11/29/2020","name":"Earnings 11/15-11/21","status":"Approved","earningAmount":2500,"withdrawalAmount":"","balance":30000},
        {"date":"11/22/2020","name":"Earnings 11/08-11/14","status":"Approved","earningAmount":2500,"withdrawalAmount":"","balance":27500},
        {"date":"11/15/2020","name":"Earnings 11/01-11/07","status":"Approved","earningAmount":2500,"withdrawalAmount":"","balance":25000},
        {"date":"11/02/2020","name":"Withdrawal (PayQuicker)","status":"Completed","earningAmount":"","withdrawalAmount":-5000,"balance":22500},
        {"date":"11/01/2020","name":"Earnings Oct 2020","status":"Approved","earningAmount":10000,"withdrawalAmount":"","balance":"27500"},
        {"date":"10/03/2020","name":"Withdrawal (PayQuicker)","status":"Completed","earningAmount":"","withdrawalAmount":-5000,"balance":17500},
        {"date":"10/02/2020","name":"Withdrawal (PayQuicker)","status":"Completed","earningAmount":"","withdrawalAmount":-5000,"balance":12500},
        {"date":"10/01/2020","name":"Earnings Sep 2020","status":"Approved","earningAmount":10000,"withdrawalAmount":"","balance":22500},
        {"date":"09/01/2020","name":"Earnings Aug 2020","status":"Approved","earningAmount":7500,"withdrawalAmount":"","balance":17500},
        {"date":"08/01/2020","name":"Earnings Jul 2020","status":"Approved","earningAmount":5000,"withdrawalAmount":"","balance":10000},
        {"date":"07/01/2020","name":"Earnings Jun 2020","status":"Approved","earningAmount":5000,"withdrawalAmount":"","balance":5000},
        {"date":"05/31/2020","name":"Starting Balance","status":"Starting-Balance","earningAmount":"","withdrawalAmount":"","balance":7500},
        {"date":"05/31/2020","name":"Total Withdrawals (Historical)","status":"Total","earningAmount":"","withdrawalAmount":-55000,"balance":""},
        {"date":"05/31/2020","name":"Total Earnings (Historical)","status":"Total","earningAmount":62500,"withdrawalAmount":"","balance":""}
    ];

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

    onRowPrepared(e) {
        if (e.data && (e.data.status === 'Approved' || e.data.status === 'Starting-Balance' || e.data.status === 'Total')) {
            e.rowElement.classList.add(e.data.status.toLowerCase());
        }
    }

    onCellPrepared(e, text: string) {
        if (e.rowType === 'header') {
            if (e.columnIndex === 0) {
                e.cellElement.colSpan = 3;
                e.cellElement.innerHTML = text;
                e.cellElement.style.textAlign = 'right';
            } else if (e.columnIndex < 3) {
                e.cellElement.style.display = 'none';
            }
        } else if (e.rowType === 'data' && e.column.dataField === 'status' && (e.value === 'Starting-Balance' || e.value === 'Total')) {
            e.cellElement.innerHTML = '';
        }
    }
}