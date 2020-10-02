/** Core imports */
import { ChangeDetectionStrategy, Component, ViewChild } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';

/** Third party imports */
import { Workbook } from 'exceljs';
import { CellRange, exportDataGrid } from 'devextreme/excel_exporter';
import saveAs from 'file-saver';

/** Application imports */
import { LayoutService } from '@app/shared/layout/layout.service';
import { DashboardWidgetsService } from '@shared/crm/dashboard-widgets/dashboard-widgets.service';
import { AppLocalizationService } from '@app/shared/common/localization/app-localization.service';
import { DxDataGridComponent, DxValidatorComponent } from '@node_modules/devextreme-angular';
import { NotifyService } from '@abp/notify/notify.service';
import { DateHelper } from '@shared/helpers/DateHelper';
import { ReferralExportService } from '@shared/common/referral/referral-export.service';
import { OrderDto } from '@shared/common/referral/commission-history/order-dto';

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
    @ViewChild('pendingTransactionsGrid', { static: false }) pendingTransactionsGrid: DxDataGridComponent;
    @ViewChild('transactionsGrid', { static: false }) transactionsGrid: DxDataGridComponent;
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
        {"date":"11/01/2020","name":"Earnings Oct 2020","status":"Approved","earningAmount":10000,"withdrawalAmount":"","balance":27500},
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
    userTimezone: string = DateHelper.getUserTimezone();
    dateFormat = 'MMM-dd-yyyy E';

    constructor(
        private layoutService: LayoutService,
        private dashboardWidgetsService: DashboardWidgetsService,
        private notifyService: NotifyService,
        private referralExportService: ReferralExportService,
        private currencyPipe: CurrencyPipe,
        private datePipe: DatePipe,
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

    downloadReport() {
        const workBook = new Workbook();
        const worksheet = workBook.addWorksheet(
            'Payout Ledger History',
            {
                properties: { defaultRowHeight: 26 },
                views: [ { showGridLines: false } ],
            }
        );
        exportDataGrid({
            component: this.pendingTransactionsGrid.instance,
            worksheet: worksheet,
            topLeftCell: { row: 8, column: 2 },
            loadPanel: { enabled: false },
            keepColumnWidths: true,
            autoFilterEnabled: false,
            customizeCell: (options => {
                const { gridCell, excelCell } = options;
                if (gridCell.rowType === 'header') {
                    excelCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F2F2F2' }};
                }
            })
        }).then((cellRange: CellRange) => {
            ReferralExportService.addTableHeader(worksheet);
            this.referralExportService.addAmountsWidget(worksheet, 'e2efda', 2, 'TOTAL AMOUNTS POSTED', [
                { name: 'Earned', value: this.currencyPipe.transform(107500) },
                { name: 'Withdrawn', value: this.currencyPipe.transform(-70000), valueColor: '00B050' }
            ]);
            this.referralExportService.addAmountsWidget(worksheet, 'fff2cc', 5, 'PENDING AMOUNTS', [
                { name: 'Earned', value: this.currencyPipe.transform(2500) },
                { name: 'Withdrawn', value: this.currencyPipe.transform(-32500), valueColor: '00B050' }
            ]);
            this.referralExportService.addAmountsWidget(worksheet, 'c6e0b4', 7, 'AVAILABLE', [
                { name: 'Balance', value: this.currencyPipe.transform(5000) }
            ]);
            this.referralExportService.addTableBorders(worksheet, cellRange);
            return exportDataGrid({
                worksheet: worksheet,
                component: this.transactionsGrid.instance,
                topLeftCell: { row: 13, column: 2 },
                loadPanel: { enabled: false },
                keepColumnWidths: true,
                autoFilterEnabled: false,
                customizeCell: (options => {
                    const { gridCell, excelCell } = options;
                    if (gridCell.rowType === 'header') {
                        excelCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E2EFDA' }};
                    }
                })
            }).then((cellRange: CellRange) => {
                this.referralExportService.addTableBorders(worksheet, cellRange);
            });
        }).then(() => {
            workBook.xlsx.writeBuffer().then((buffer: BlobPart) => {
                saveAs(new Blob([buffer], { type: 'application/octet-stream' }), 'PayoutLedgerHistory.xlsx');
            });
        });
    }

    calculateDateValue = transaction => {
        return this.datePipe.transform(transaction.date, this.dateFormat, this.userTimezone);
    }

    calculateAmountValue = (order: OrderDto) => {
        return this.currencyPipe.transform(order.Amount);
    }
}