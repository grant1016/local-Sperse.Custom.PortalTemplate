/** Core imports */
import { Component, Injector, ViewChild, OnDestroy } from '@angular/core';

/** Core imports */
import DataSource from 'devextreme/data/data_source';
import ODataStore from 'devextreme/data/odata/store';
import { DxDataGridComponent } from 'devextreme-angular/ui/data-grid';
import { ImageViewerComponent } from 'ng2-image-viewer';
import { Observable } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import startCase from 'lodash/startCase';

/** Application imports */
import { LifecycleSubjectsService } from '@shared/common/lifecycle-subjects/lifecycle-subjects.service';
import { AccountSelectorService } from '@app/shared/layout/account-selector/account-selector.service';
import { AppConsts } from '@shared/AppConsts';
import { AppPermissions } from '@shared/AppPermissions';
import { AppPermissionService } from '@shared/common/auth/permission.service';
import { ODataService } from '@shared/common/odata/odata.service';
import { DataGridService } from '@app/shared/common/data-grid.service/data-grid.service';
import { AppComponentBase } from '@shared/common/app-component-base';
import { InvoiceStatus, UserInvoiceServiceProxy } from '@shared/service-proxies/service-proxies';
import { StringHelper } from '@shared/helpers/StringHelper';
import { RequestHelper } from '@shared/helpers/RequestHelper';
import { InvoiceFields } from './invoice-fields.enum';
import { UserInvoiceDto } from './invoice-dto.interface';
import { KeysEnum } from '@shared/common/keys.enum/keys.enum';

@Component({
    selector: 'app-invoices',
    templateUrl: './invoices.component.html',
    styleUrls: ['./invoices.component.less'],
    providers: [ UserInvoiceServiceProxy, LifecycleSubjectsService ]
})
export class InvoicesComponent extends AppComponentBase implements OnDestroy {
    @ViewChild(DxDataGridComponent) dataGrid: DxDataGridComponent;
    @ViewChild(ImageViewerComponent) imageViewer: ImageViewerComponent;
    readonly invoiceFields: KeysEnum<UserInvoiceDto> = InvoiceFields;
    formatting = AppConsts.formatting;
    startCase = startCase;
    defaultGridPagerConfig = DataGridService.defaultGridPagerConfig;
    previewContent = '';
    selectedOrgUnitId: number;
    dataSource: DataSource;
    currencyFormat = {
        type: 'currency',
        precision: 2
    };

    constructor(
        injector: Injector,
        private oDataService: ODataService,
        private permissionService: AppPermissionService,
        private userInvoiceProxy: UserInvoiceServiceProxy,
        private lifeCycleSubject: LifecycleSubjectsService,
        public accountSelectorService: AccountSelectorService
    ) {
        super(injector);
        this.accountSelectorService.selectedOrgUnitIds$.pipe(
            takeUntil(this.lifeCycleSubject.deactivate$)
        ).subscribe((ids?: number[]) => {
            this.dataSource = new DataSource({
                sort: [{ selector: 'Date', desc: true }],
                requireTotalCount: true,
                store: new ODataStore({
                    url: this.oDataService.getODataUrl(
                        'UserInvoices',
                        [
                            {
                                'and': [
                                    { [this.invoiceFields.Status]: { 'ne': InvoiceStatus.Draft } },
                                    { [this.invoiceFields.Status]: { 'ne': InvoiceStatus.Canceled } }
                                ]
                            }
                        ]
                    ),
                    version: AppConsts.ODataVersion,
                    beforeSend: (request) => {
                        request.headers['Authorization'] = 'Bearer ' + abp.auth.getToken();
                        if (this.permissionService.isGranted(AppPermissions.CRM))
                            request.params.payerOrganizationUnitId = this.selectedOrgUnitId = ids ? ids[0] : undefined;
                    },
                    onLoaded: (data) => {
                        this.isDataLoaded = true;
                        if (data) {
                            this.getPdfLink(data[0].Id).subscribe(
                                (pdfLink: string) => this.getPdfData(pdfLink)
                            );
                        }
                    },
                    deserializeDates: false
                })
            });
        });
    }

    onContentReady(event) {
        this.setGridDataLoaded();
        this.dataGrid && this.dataGrid.instance.selectRowsByIndexes([0]);
        event.component.columnOption('command:edit', {
            visibleIndex: -1,
            width: 40
        });
    }

    onRowClick(event) {
        if (event.data) {
            this.getPdfLink(event.data.Id).subscribe(
                (pdfLink: string) => this.getPdfData(pdfLink)
            );
        } else
            event.event.preventDefault();
    }

    getPdfLink(invoiceId): Observable<string> {
        this.startLoading(true);
        this.previewContent = '';
        return this.userInvoiceProxy.generatePdf(invoiceId, this.selectedOrgUnitId).pipe(
            finalize(() => this.finishLoading(true))
        );
    }

    getPdfData(pdfLink) {
        RequestHelper.downloadFileBlob(pdfLink, (blob) => {
            let reader = new FileReader();
            reader.addEventListener('loadend', () => {
                this.previewContent = StringHelper.getBase64(reader.result as string);
            });
            reader.readAsDataURL(blob);
            super.finishLoading(true);
        });
    }

    refresh() {
        this.dataGrid.instance.refresh();
    }

    ngOnDestroy() {
        this.lifeCycleSubject.deactivate.next();
    }
}
