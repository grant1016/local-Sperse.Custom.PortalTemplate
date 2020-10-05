/** Core imports */
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';

/** Third party imports */
import { Workbook } from 'exceljs';
import { CellRange, exportDataGrid } from 'devextreme/excel_exporter';
import saveAs from 'file-saver';
import * as moment from 'moment';

/** Application imports */
import { LayoutService } from '@app/shared/layout/layout.service';
import { DashboardWidgetsService } from '@shared/crm/dashboard-widgets/dashboard-widgets.service';
import { AppLocalizationService } from '@app/shared/common/localization/app-localization.service';
import { DxDataGridComponent, DxValidatorComponent } from '@node_modules/devextreme-angular';
import { NotifyService } from '@abp/notify/notify.service';
import { DateHelper } from '@shared/helpers/DateHelper';
import { ReferralExportService } from '@shared/common/referral/referral-export.service';
import {
    CommissionLedgerEntryInfo,
    CommissionLedgerEntryStatus,
    GetLedgerOutput, GetLedgerTotalsOutput,
    UserCommissionServiceProxy
} from '@shared/service-proxies/service-proxies';
import { ReferralService } from '@shared/common/referral/referral.service';

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
export class LedgerBalanceComponent implements OnInit {
    @ViewChild('pendingTransactionsGrid', { static: false }) pendingTransactionsGrid: DxDataGridComponent;
    @ViewChild('transactionsGrid', { static: false }) transactionsGrid: DxDataGridComponent;
    @ViewChild(DxValidatorComponent, { static: false }) validator: DxValidatorComponent;
    withdrawalAmount = null;
    ledger: GetLedgerOutput;
    pendingCommissions: CommissionLedgerEntryInfo[] = [];
    approvedCommissions: CommissionLedgerEntryInfo[] = [];
    userTimezone: string = DateHelper.getUserTimezone();
    dateFormat = 'MMM-dd-yyyy E';
    ledgerTotals: GetLedgerTotalsOutput;
    pendingEarningsTotal = 0;
    pendingWithdrawalsTotal = 0;
    earningsTotal = 0;
    withdrawalsTotal = 0;
    isDataLoaded = false;

    constructor(
        private layoutService: LayoutService,
        private dashboardWidgetsService: DashboardWidgetsService,
        private notifyService: NotifyService,
        private referralExportService: ReferralExportService,
        private currencyPipe: CurrencyPipe,
        private datePipe: DatePipe,
        private referralService: ReferralService,
        private userCommission: UserCommissionServiceProxy,
        private changeDetectorRef: ChangeDetectorRef,
        public ls: AppLocalizationService
    ) {}

    ngOnInit() {
        this.referralService.ledgerTotals$.subscribe((ledgerTotals: GetLedgerTotalsOutput) => {
            this.ledgerTotals = ledgerTotals;
        });
        this.userCommission.getLedger(undefined).subscribe((ledger: GetLedgerOutput) => {
            this.ledger = ledger;
            let balance = 0;
            ledger.entries
                .sort((entryA: CommissionLedgerEntryInfo, entryB: CommissionLedgerEntryInfo) => {
                    return moment(entryA.date).isAfter(entryB.date) ? 1 : -1;
                })
                .forEach((commissionLedgerInfo: CommissionLedgerEntryInfo) => {
                    if (commissionLedgerInfo.status === CommissionLedgerEntryStatus.Pending) {
                        this.pendingCommissions.push(commissionLedgerInfo);
                        if (commissionLedgerInfo.totalAmount > 0) {
                            this.pendingEarningsTotal += commissionLedgerInfo.totalAmount;
                        } else {
                            this.pendingWithdrawalsTotal += commissionLedgerInfo.totalAmount;
                        }
                    } else {
                        commissionLedgerInfo['balance'] = balance += commissionLedgerInfo.totalAmount;
                        this.approvedCommissions.unshift(commissionLedgerInfo);
                        if (commissionLedgerInfo.totalAmount > 0) {
                            this.earningsTotal += commissionLedgerInfo.totalAmount;
                        } else {
                            this.withdrawalsTotal += commissionLedgerInfo.totalAmount;
                        }
                    }
                });

            const startingBalanceRow: any = {
                id: undefined,
                status: 'Starting-Balance',
                startDate: null,
                endDate: null,
                date: null,
                type: 'Starting Balance',
                totalAmount: null,
                balance: this.ledger.startingEarningsBalance - this.ledger.startingWithdrawalsBalance
            };
            const totalWithdrawalsRow: any = {
                id: undefined,
                status: 'Total-Withdrawals',
                startDate: null,
                endDate: null,
                date: null,
                type: 'Total Withdrawals (Historical)',
                totalAmount: this.ledger.startingWithdrawalsBalance || undefined,
                balance: null
            };
            const totalEarningsRow: any = {
                id: undefined,
                status: 'Total-Earnings',
                startDate: null,
                endDate: null,
                date: null,
                type: 'Total Earnings (Historical)',
                totalAmount: this.ledger.startingEarningsBalance || undefined,
                balance: null
            };
            this.approvedCommissions.push(startingBalanceRow, totalWithdrawalsRow, totalEarningsRow);
            this.isDataLoaded = true;
            this.changeDetectorRef.detectChanges();
        });
    }

    save() {
        if (this.validator.instance.validate().isValid) {
            this.notifyService.success(this.ls.l('Thanks for you request'));
        }
    }

    reset() {
        this.withdrawalAmount = null;
    }

    onRowPrepared(e) {
        if (e.data && (e.data.status === 'Approved'
            || e.data.status === 'Starting-Balance'
            || e.data.status === 'Total-Earnings'
            || e.data.status === 'Total-Withdrawals')
        ) {
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
        } else if (e.rowType === 'data' && e.column.dataField === 'status' && (e.value === 'Starting-Balance'
            || e.value === 'Total-Earnings' || e.value === 'Total-Withdrawals')) {
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
                { name: 'Earned', value: this.currencyPipe.transform(this.ledgerTotals.earnedAmount) },
                { name: 'Withdrawn', value: this.currencyPipe.transform(this.ledgerTotals.withdrawnAmount), valueColor: '00B050' }
            ]);
            this.referralExportService.addAmountsWidget(worksheet, 'fff2cc', 5, 'PENDING AMOUNTS', [
                { name: 'Earned', value: this.currencyPipe.transform(this.ledgerTotals.pendingEarningsAmount) },
                { name: 'Withdrawn', value: this.currencyPipe.transform(this.ledgerTotals.pendingEarningsAmount), valueColor: '00B050' }
            ]);
            this.referralExportService.addAmountsWidget(worksheet, 'c6e0b4', 7, 'AVAILABLE', [
                { name: 'Balance', value: this.currencyPipe.transform(this.ledgerTotals.availableBalance) }
            ]);
            this.referralExportService.addTableBorders(worksheet, cellRange);
            return exportDataGrid({
                worksheet: worksheet,
                component: this.transactionsGrid.instance,
                topLeftCell: { row: cellRange.from.row + 2, column: 2 },
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

    calculateDateValue = (commissionLedgerInfo: CommissionLedgerEntryInfo) => {
        return this.datePipe.transform(commissionLedgerInfo.date, this.dateFormat, this.userTimezone);
    }

    calculateDescriptionValue = (commissionLedgerInfo: CommissionLedgerEntryInfo) => {
        const startDate: string = commissionLedgerInfo.startDate ? commissionLedgerInfo.startDate.format('MM/DD') : '';
        const endDate: string = commissionLedgerInfo.endDate ? commissionLedgerInfo.endDate.format('MM/DD') : '';
        const date: string = startDate === endDate ? startDate : (startDate + ( startDate && endDate ? '-' : '') + endDate);
        return commissionLedgerInfo.type + ' ' + date;
    }

    calculateEarningsAmountValue = (commissionLedgerInfo: CommissionLedgerEntryInfo) => {
        return commissionLedgerInfo.totalAmount > 0
            ? this.currencyPipe.transform(commissionLedgerInfo.totalAmount)
            : (commissionLedgerInfo.status as any == 'Total-Earnings' ? 0 : null );
    }

    calculateWithdrawalAmount = (commissionLedgerInfo: CommissionLedgerEntryInfo) => {
        return commissionLedgerInfo.totalAmount < 0
               ? this.currencyPipe.transform(commissionLedgerInfo.totalAmount)
               : (commissionLedgerInfo.status as any == 'Total-Withdrawals' ? 0 : null );
    }
}