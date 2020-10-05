/** Core imports */
import { ChangeDetectionStrategy, Component, OnInit, ViewChild } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';

/** Third party imports */
import DataSource from 'devextreme/data/data_source';
import { DxDataGridComponent } from 'devextreme-angular/ui/data-grid';
import { exportDataGrid } from 'devextreme/excel_exporter';
import { Workbook } from 'exceljs';
import saveAs from 'file-saver';

/** Application imports */
import { KeysEnum } from '@shared/common/keys.enum/keys.enum';
import { AppLocalizationService } from '@app/shared/common/localization/app-localization.service';
import { AppConsts } from '@shared/AppConsts';
import { DateHelper } from '@shared/helpers/DateHelper';
import { DataGridService } from '@app/shared/common/data-grid.service/data-grid.service';
import { AppHttpInterceptor } from '@shared/http/appHttpInterceptor';
import { Param } from '@shared/common/odata/param.model';
import { ODataService } from '@shared/common/odata/odata.service';
import { LoadingService } from '@shared/common/loading-service/loading.service';
import { CellRange } from '@node_modules/devextreme/excel_exporter';
import { ReferralExportService } from '@shared/common/referral/referral-export.service';
import { CommissionFields } from '@shared/common/referral/commission-history/commission-fields.enum';
import { CommissionDto } from '@shared/common/referral/commission-history/commission-dto';
import { GetCommissionTotalsOutput } from '@shared/service-proxies/service-proxies';
import { ReferralService } from '@shared/common/referral/referral.service';

@Component({
    selector: 'commission-history',
    templateUrl: 'commission-history.component.html',
    styleUrls: [
        '../shared/styles/header.less',
        '../shared/styles/data-grid.less',
        'commission-history.component.less'
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CommissionHistoryComponent implements OnInit {
    @ViewChild(DxDataGridComponent, { static: false }) dataGrid: DxDataGridComponent;
    readonly commissionFields: KeysEnum<CommissionDto> = CommissionFields;
    dateFormat = 'MMM-dd-yyyy';
    userTimezone: string = DateHelper.getUserTimezone();
    defaultGridPagerConfig = DataGridService.defaultGridPagerConfig;
    searchValue;
    dataSource: DataSource = new DataSource({
        requireTotalCount: true,
        store: {
            type: 'odata',
            key: this.commissionFields.Id,
            url: this.getODataUrl('UserCommissions'),
            version: AppConsts.ODataVersion,
            deserializeDates: false,
            beforeSend: (request) => {
                this.loadingService.startLoading();
                request.headers['Authorization'] = 'Bearer ' + abp.auth.getToken();
                if (this.searchValue) {
                    request.params.quickSearchString = this.searchValue;
                }
                request.params.$select = DataGridService.getSelectFields(
                    this.dataGrid,
                    [ this.commissionFields.Id ]
                );
            },
            onLoaded: () => {
                this.loadingService.finishLoading();
            }
        }
    });
    commissionTotals: GetCommissionTotalsOutput;

    constructor(
        private oDataService: ODataService,
        private loadingService: LoadingService,
        private datePipe: DatePipe,
        private currencyPipe: CurrencyPipe,
        private referralExportService: ReferralExportService,
        private referralService: ReferralService,
        public httpInterceptor: AppHttpInterceptor,
        public ls: AppLocalizationService
    ) {}

    ngOnInit() {
        this.referralService.commissionTotals$.subscribe((commissionTotals: GetCommissionTotalsOutput) => {
            this.commissionTotals = commissionTotals;
        })
    }

    getQuickSearchParam() {
        return this.searchValue ? { name: 'quickSearchString', value: this.searchValue } : null;
    }

    getODataUrl(uri: string, filter?: Object, params: Param[] = null) {
        const searchParam = this.getQuickSearchParam();
        params = (searchParam && [searchParam] || []).concat(params || []);
        return this.oDataService.getODataUrl(uri, filter, null, params);
    }

    getCellColor(commission: CommissionDto): string {
        return commission.Status === 'Approved' ? '#38bd6c' : '#d16a39';
    }

    downloadReport() {
        const workBook = new Workbook();
        const worksheet = workBook.addWorksheet(
            'Commission History',
            {
                properties: { defaultRowHeight: 26 },
                views: [ { showGridLines: false } ]
            }
        );
        exportDataGrid({
            component: this.dataGrid.instance,
            worksheet: worksheet,
            topLeftCell: { row: 8, column: 2 },
            loadPanel: { enabled: false },
            keepColumnWidths: true,
            autoFilterEnabled: true,
            customizeCell: (options => {
                const { gridCell, excelCell } = options;
                if (gridCell.rowType === 'header') {
                    excelCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F2F2F2' }};
                } else if (gridCell.column.dataField === this.commissionFields.CommissionAmount || gridCell.column.dataField === this.commissionFields.Status) {
                    excelCell.font = {
                        color: { argb: this.getCellColor(gridCell.data).slice(1) }
                    }
                }
            })
        }).then((cellRange: CellRange) => {
            ReferralExportService.addTableHeader(worksheet);
            this.referralExportService.addAmountsWidget(worksheet, 'e2efda', 2, 'TOTAL AMOUNTS POSTED', [
                { name: 'Earned', value: this.currencyPipe.transform(this.commissionTotals.earnings) },
                { name: 'Withdrawn', value: this.currencyPipe.transform(this.commissionTotals.withdrawn), valueColor: '00B050' }
            ]);
            this.referralExportService.addAmountsWidget(worksheet, 'fff2cc', 5, 'PENDING AMOUNTS', [
                { name: 'Earned', value: this.currencyPipe.transform(this.commissionTotals.pendingEarnings) },
                { name: 'Withdrawn', value: this.currencyPipe.transform(this.commissionTotals.pendingWithdrawn), valueColor: '00B050' }
            ]);
            this.referralExportService.addAmountsWidget(worksheet, 'c6e0b4', 8, 'AVAILABLE', [
                { name: 'Balance', value: this.currencyPipe.transform(this.commissionTotals.earnings - this.commissionTotals.withdrawn) }
            ]);
            this.referralExportService.addTableBorders(worksheet, cellRange);
        }).then(() => {
            workBook.xlsx.writeBuffer().then((buffer: BlobPart) => {
                saveAs(new Blob([buffer], { type: 'application/octet-stream' }), 'CommissionHistory.xlsx');
            });
        });
    }

    calculateDateValue = (commission: CommissionDto) => {
        return this.datePipe.transform(commission.OrderDate, this.dateFormat, this.userTimezone);
    }

    calculateSaleAmountValue = (commission: CommissionDto) => {
        return this.currencyPipe.transform(commission.ProductAmount);
    }

    calculateCommissionAmountValue = (commission: CommissionDto) => {
        return this.currencyPipe.transform(commission.CommissionAmount);
    }

}