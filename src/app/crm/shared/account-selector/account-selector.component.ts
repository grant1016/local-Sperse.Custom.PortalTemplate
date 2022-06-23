/** Core imports */
import { Component, Input, ViewChild } from '@angular/core';

/** Third party imports */
import { DxDropDownBoxComponent } from 'devextreme-angular/ui/drop-down-box';
import { Observable } from 'rxjs';
import { first, map } from 'rxjs/operators';

/** Application imports */
import { CrmService } from '@app/crm/crm.service';
import { OrganizationUnitShortDto } from '@shared/service-proxies/service-proxies';

@Component({
    selector: 'app-account-selector',
    templateUrl: './account-selector.component.html',
    styleUrls: ['./account-selector.component.less']
})
export class AccountSelectorComponent {
    @ViewChild(DxDropDownBoxComponent) dropDown: DxDropDownBoxComponent;
    @Input() symbolWidth = 20;
    @Input() minWidth = 400;
    @Input() compact = false;
    disabled$: Observable<boolean> = this.crmService.selectedOrgUnitIds$.pipe(
        first(),
        map(() => this.crmService.initialOrgUnits.length <= 1)
    );
    dropDownWidth: number;
    listComponent: any;
    searchTimeout: any;
    searchValue = '';

    constructor(
        public crmService: CrmService
    ) {}

    valueChanged(event) {
        this.calculateDropDownWidth(event.itemData);
        this.crmService.selectedOrgUnitIds.next([event.itemData.id]);
        this.crmService.loadStatus(event.itemData);
        this.dropDown.instance.close();
    }

    getSelectedName() {
        return this.crmService.selectedAccount
            ? this.crmService.selectedAccount.displayName
            : this.crmService.userInfo.fullName;
    }

    calculateDropDownWidth(selectedAccount: OrganizationUnitShortDto) {
        const textValue = selectedAccount
            ? selectedAccount.displayName
            : this.crmService.userInfo.fullName;

        textValue.length * this.symbolWidth + 45 > this.minWidth
            ? this.dropDownWidth = textValue.length * this.symbolWidth + 45
            : this.dropDownWidth = this.minWidth;
    }

    loadOrgUnits(searchValue?: string): Observable<OrganizationUnitShortDto[]> {
        this.searchValue = searchValue;
        return this.crmService.getOrgUnits(searchValue);
    }

    onSearchChanged = (event) => {
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(() => {
            let searchValue = event.component.option('value');
            if (this.searchValue != searchValue) {
                this.searchValue = searchValue;
                abp.ui.setBusy(this.listComponent.element());
                this.loadOrgUnits(searchValue).subscribe((organizationUnits: OrganizationUnitShortDto[]) => {
                    this.listComponent.option('dataSource', organizationUnits);
                    event.component.option('value', searchValue);
                    abp.ui.clearBusy(this.listComponent.element());
                });
            }
        }, 600);
        if (event && event.event)
            event.event.stopPropagation();
    }

    onInitialized(event) {
        this.listComponent = event.component;
        event.component.option('items', this.crmService.initialOrgUnits);
    }
}