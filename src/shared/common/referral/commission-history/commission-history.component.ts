/** Core imports */
import { ChangeDetectionStrategy, Component, ViewChild } from '@angular/core';

/** Third party imports */
import DataSource from 'devextreme/data/data_source';
import { DxDataGridComponent } from 'devextreme-angular/ui/data-grid';

/** Application imports */
import { KeysEnum } from '@shared/common/keys.enum/keys.enum';
import { OrderDto } from '@shared/common/referral/commission-history/order-dto';
import { OrderFields } from '@shared/common/referral/commission-history/order-fields.enum';
import { AppLocalizationService } from '@app/shared/common/localization/app-localization.service';
import { AppConsts } from '@shared/AppConsts';
import { DateHelper } from '@shared/helpers/DateHelper';
import { DataGridService } from '@app/shared/common/data-grid.service/data-grid.service';
import { AppHttpInterceptor } from '@shared/http/appHttpInterceptor';
import { Param } from '@shared/common/odata/param.model';
import { ODataService } from '@shared/common/odata/odata.service';
import { LoadingService } from '@shared/common/loading-service/loading.service';

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
export class CommissionHistoryComponent {
    @ViewChild(DxDataGridComponent, { static: false }) dataGrid: DxDataGridComponent;
    readonly orderFields: KeysEnum<OrderDto> = OrderFields;
    formatting = AppConsts.formatting;
    userTimezone: string = DateHelper.getUserTimezone();
    defaultGridPagerConfig = DataGridService.defaultGridPagerConfig;
    searchValue;
    dataSource: DataSource = new DataSource({
        requireTotalCount: true,
        store: {
            type: 'odata',
            key: this.orderFields.Id,
            url: this.getODataUrl('Order'),
            version: AppConsts.ODataVersion,
            deserializeDates: false,
            beforeSend: (request) => {
                this.loadingService.startLoading();
                request.headers['Authorization'] = 'Bearer ' + abp.auth.getToken();
                if (this.searchValue) {
                    request.params.quickSearchString = this.searchValue;
                }
                request.params.$select = DataGridService.getSelectFields(this.dataGrid);
            },
            onLoaded: () => {
                this.loadingService.finishLoading();
            }
        }
    });

    constructor(
        private oDataService: ODataService,
        private loadingService: LoadingService,
        public httpInterceptor: AppHttpInterceptor,
        public ls: AppLocalizationService
    ) {}

    getQuickSearchParam() {
        return this.searchValue ? { name: 'quickSearchString', value: this.searchValue } : null;
    }

    getODataUrl(uri: string, filter?: Object, params: Param[] = null) {
        const searchParam = this.getQuickSearchParam();
        params = (searchParam && [searchParam] || []).concat(params || []);
        return this.oDataService.getODataUrl(uri, filter, null, params);
    }

    searchValueChange(e: object) {
        if (this.searchValue != e['value']) {
            this.searchValue = e['value'];
            this.dataGrid.instance.refresh();
        }
    }

    getCellColor(status: string): string {
        return status === 'Complete' ? '#38bd6c' : '#d16a39';
    }

}