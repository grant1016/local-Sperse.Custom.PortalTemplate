/** Core imports */
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';

/** Third party imports */
import { Workbook } from 'exceljs';
import { CellRange, exportDataGrid } from 'devextreme/excel_exporter';
import saveAs from 'file-saver';
import * as moment from 'moment';
import { Observable, Subject } from 'rxjs';
import { switchMap, takeUntil } from 'rxjs/operators';
import { DxDataGridComponent } from 'devextreme-angular/ui/data-grid';
import { DxValidatorComponent } from 'devextreme-angular/ui/validator';

/** Application imports */
import { LayoutService } from '@app/shared/layout/layout.service';
import { DashboardWidgetsService } from '@shared/crm/dashboard-widgets/dashboard-widgets.service';
import { AppLocalizationService } from '@app/shared/common/localization/app-localization.service';
import { NotifyService } from '@abp/notify/notify.service';
import { ReferralExportService } from '@shared/common/referral/referral-export.service';
import {
    CommissionLedgerEntryInfo,
    CommissionLedgerEntryStatus,
    CommissionLedgerEntryType,
    GetLedgerOutput, GetLedgerTotalsOutput,
    UserCommissionServiceProxy
} from '@shared/service-proxies/service-proxies';
import { ReferralService } from '@shared/common/referral/referral.service';
import { ExcelDataGridCell } from '@node_modules/devextreme/excel_exporter';

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
export class LedgerBalanceComponent implements OnInit, OnDestroy {
    @ViewChild('pendingTransactionsGrid', { static: false }) pendingTransactionsGrid: DxDataGridComponent;
    @ViewChild('transactionsGrid', { static: false }) transactionsGrid: DxDataGridComponent;
    @ViewChild(DxValidatorComponent, { static: false }) validator: DxValidatorComponent;
    withdrawalAmount = null;
    ledger: GetLedgerOutput;
    pendingCommissions: CommissionLedgerEntryInfo[] = [];
    approvedCommissions: CommissionLedgerEntryInfo[] = [];
    dateFormat = 'MMM-dd-yyyy E';
    currencyFormat = {
        type: 'currency',
        precision: 2
    };
    ledgerTotals: GetLedgerTotalsOutput;
    pendingEarningsTotal = 0;
    pendingWithdrawalsTotal = 0;
    earningsTotal = 0;
    withdrawalsTotal = 0;
    isDataLoaded = false;
    private startDate: moment.Moment = moment('2020-06-01 00:00:00');
    private destroy: Subject<any> = new Subject<any>();
    private destroy$: Observable<any> = this.destroy.asObservable();

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
        this.referralService.ledgerTotals$.pipe(
            takeUntil(this.destroy$)
        ).subscribe((ledgerTotals: GetLedgerTotalsOutput) => {
            this.ledgerTotals = ledgerTotals;
        });
        this.referralService.refresh$.pipe(
            takeUntil(this.destroy$),
            switchMap(() => this.userCommission.getLedger(this.startDate))
        ).subscribe((ledger: GetLedgerOutput) => {
            this.ledger = ledger;
            this.pendingCommissions = [];
            this.approvedCommissions = [];
            this.earningsTotal = this.withdrawalsTotal = this.pendingEarningsTotal = this.pendingWithdrawalsTotal = 0;
            let balance = ledger.startingEarningsBalance + ledger.startingWithdrawalsBalance;
            ledger.entries
                .sort((entryA: CommissionLedgerEntryInfo, entryB: CommissionLedgerEntryInfo) => {
                    return moment(entryA.date).isAfter(entryB.date) ? 1 : -1;
                })
                .forEach((commissionLedgerInfo: CommissionLedgerEntryInfo) => {
                    if (commissionLedgerInfo.status === CommissionLedgerEntryStatus.Pending) {
                        this.pendingCommissions.unshift(commissionLedgerInfo);
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
            /** Increment balance with pending balances */
            for (let i = this.pendingCommissions.length - 1; i >= 0; i--) {
                this.pendingCommissions[i]['balance'] = balance += this.pendingCommissions[i].totalAmount;
            }
            this.isDataLoaded = true;
            this.changeDetectorRef.detectChanges();
        });
    }

    emptyText = () => null;

    getFormattedStartDate = () => 'May-31-2020 Sun';

    customizeStartingBalance = () => this.ledger && this.currencyPipe.transform(this.ledger.startingEarningsBalance + this.ledger.startingWithdrawalsBalance);

    customizeStartingEarnings = () => this.ledger && this.currencyPipe.transform(this.ledger.startingEarningsBalance);

    customizeStartingWithdrawals = () => this.ledger && this.currencyPipe.transform(this.ledger.startingWithdrawalsBalance);

    get approvedEarningsTotal(): number {
        return this.earningsTotal + (this.ledger && this.ledger.startingEarningsBalance);
    }

    get approvedWithdrawalsTotal(): number {
        return this.withdrawalsTotal + (this.ledger && this.ledger.startingWithdrawalsBalance);
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

    onCellPrepared(e) {
        if (e.rowType === 'totalFooter' ) {
            if (e.columnIndex === 1) {
                e.cellElement.colSpan = 2;
            } else if (e.columnIndex === 2) {
                e.cellElement.style.display = 'none';
            }
        }
    }

    downloadReport() {
        const workBook = new Workbook();
        const worksheet = workBook.addWorksheet(
            'Payout Ledger History',
            {
                properties: { defaultRowHeight: 26 },
                views: [ { showGridLines: false, state: 'normal' } ],
            }
        );
        exportDataGrid({
            component: this.pendingTransactionsGrid.instance,
            worksheet: worksheet,
            topLeftCell: { row: 8, column: 2 },
            loadPanel: { enabled: false },
            keepColumnWidths: true,
            autoFilterEnabled: false,
            customizeCell: (options) => this.customizeExportCell(options)
        }).then((cellRange: CellRange) => {
            ReferralExportService.addTableHeader(worksheet, 'YOUR PAYOUT LEDGER HISTORY');
            this.referralExportService.addAmountsWidget(worksheet, 'e2efda', 2, 'TOTAL AMOUNTS POSTED', [
                { name: 'Earned', value: this.ledgerTotals.earnedAmount },
                { name: 'Withdrawn', value: this.ledgerTotals.withdrawnAmount }
            ]);
            this.referralExportService.addAmountsWidget(worksheet, 'fff2cc', 5, 'PENDING AMOUNTS', [
                { name: 'Earned', value: this.ledgerTotals.pendingEarningsAmount },
                { name: 'Withdrawn', value: this.ledgerTotals.pendingWithdrawalsAmount }
            ]);
            this.referralExportService.addAmountsWidget(worksheet, 'c6e0b4', 7, 'AVAILABLE', [
                { name: 'Balance', value: this.ledgerTotals.availableBalance }
            ]);
            this.referralExportService.addTableBorders(worksheet, cellRange, 2);
            this.referralExportService.addMergedColumnLeftBorder(worksheet, cellRange);
            return exportDataGrid({
                worksheet: worksheet,
                component: this.transactionsGrid.instance,
                topLeftCell: { row: cellRange.to.row + 2, column: 2 },
                loadPanel: { enabled: false },
                keepColumnWidths: true,
                autoFilterEnabled: false,
                customizeCell: (options: { gridCell?: ExcelDataGridCell, excelCell?: any }) => this.customizeExportCell(options, 'E2EFDA')
            }).then((cellRange: CellRange) => {
                this.referralExportService.addTableBorders(worksheet, cellRange, 2);
                this.referralExportService.addMergedColumnLeftBorder(worksheet, cellRange);
            });
        }).then(() => {
            workBook.xlsx.writeBuffer().then((buffer: BlobPart) => {
                saveAs(
                    new Blob([buffer], { type: 'application/octet-stream' }),
                    ReferralExportService.getFileName('Ledger')
                );
            });
        });
    }

    customizeExportCell(options: { gridCell?: ExcelDataGridCell, excelCell?: any}, color?: string) {
        const { gridCell, excelCell } = options;
        if (gridCell.rowType === 'header') {
            excelCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: color || 'F2F2F2' }};
            if (gridCell.column['hasColumns']) {
                excelCell.alignment = { horizontal: 'right' };
                /** Remove dollar sign */
                if (gridCell.column.caption && gridCell.column.cssClass.indexOf('amount') >= 0) {
                    excelCell.numFmt = ReferralExportService.currencyFormat;
                    excelCell.value = +gridCell.column.caption.replace(/[^0-9.-]+/g,'');
                }
            }
        }
        if (gridCell.column.cssClass.indexOf('amount') >= 0) {
            excelCell.numFmt = ReferralExportService.currencyFormat;
        }
    }

    calculateDescriptionValue = (commissionLedgerInfo: CommissionLedgerEntryInfo) => {
        let description: string = commissionLedgerInfo.type;
        if (commissionLedgerInfo.paymentSystem) {
            description += ' (' + commissionLedgerInfo.paymentSystem + ')';
        } else {
            const startDate: string = commissionLedgerInfo.startDate ? commissionLedgerInfo.startDate.format('MM/DD') : '';
            const endDate: string = commissionLedgerInfo.endDate ? commissionLedgerInfo.endDate.format('MM/DD') : '';
            const date: string = startDate === endDate ? startDate : (startDate + ( startDate && endDate ? '-' : '') + endDate);
            description += ' ' + date
        }
        return description;
    }

    calculateStatusValue = (commissionLedgerInfo: CommissionLedgerEntryInfo) => {
        const status: any = commissionLedgerInfo.status;
        return status === 'Starting-Balance' || status === 'Total-Earnings' || status === 'Total-Withdrawals'
               ? ''
               : commissionLedgerInfo.status;
    }

    calculateEarningsAmount = (commissionLedgerInfo: CommissionLedgerEntryInfo) => {
        return commissionLedgerInfo.type === CommissionLedgerEntryType.Earning
            ? commissionLedgerInfo.totalAmount
            : (commissionLedgerInfo.status as any == 'Total-Earnings' ? 0 : null);
    }

    calculateWithdrawalAmount = (commissionLedgerInfo: CommissionLedgerEntryInfo) => {
        return commissionLedgerInfo.type === CommissionLedgerEntryType.Withdrawal
               ? commissionLedgerInfo.totalAmount
               : (commissionLedgerInfo.status as any == 'Total-Withdrawals' ? 0 : null);
    }

    ngOnDestroy() {
        this.destroy.next();
    }
}