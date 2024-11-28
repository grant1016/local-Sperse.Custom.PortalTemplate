/** Core imports */
import { Component, Input, ViewChild } from '@angular/core';

/** Third party imports */
import { DxDropDownBoxComponent } from 'devextreme-angular/ui/drop-down-box';
import { Observable } from 'rxjs';
import { first, map } from 'rxjs/operators';

/** Application imports */
import { AccountSelectorService } from './account-selector.service';
import { OrganizationUnitShortDto } from '@shared/service-proxies/service-proxies';
import { AppLocalizationService } from '@app/shared/common/localization/app-localization.service';
import { AppSessionService } from '@root/shared/common/session/app-session.service';
import { LayoutService } from '../layout.service';

@Component({
    selector: 'app-account-selector',
    templateUrl: './account-selector.component.html',
    styleUrls: ['./account-selector.component.less']
})
export class AccountSelectorComponent {
    @ViewChild(DxDropDownBoxComponent) dropDown: DxDropDownBoxComponent;
    @Input() symbolWidth = 20;
    @Input() minWidth = 350;
    @Input() maxWidth = 450;
    @Input() compact = false;
    disabled$: Observable<boolean> = this.accountSelectorService.selectedOrgUnitIds$.pipe(
        first(),
        map(() => this.accountSelectorService.initialOrgUnits.length <= 1)
    );
    dropDownWidth: number;
    listComponent: any;
    searchTimeout: any;
    searchValue = '';

    constructor(
        public ls: AppLocalizationService,
        public accountSelectorService: AccountSelectorService,
        private appSessionService: AppSessionService,
        private layoutService: LayoutService
    ) {}

    getInputColor() {
        if (this.appSessionService.tenant && this.appSessionService.tenant.portalCustomCssId)
            return {};
        let color = this.layoutService.getLayoutColor('navTextColor');
        if (!color)
            return {};
        return { style: `color: ${color}`};
    }

    valueChanged(event) {
        this.accountSelectorService.selectedOrgUnitIds.next(
            event.itemData.id == -1 ? undefined : [event.itemData.id]);
        this.accountSelectorService.selectedAccount = event.itemData;
        this.dropDown.instance.close();
    }

    getSelectedName() {
        return this.accountSelectorService.selectedAccount
            ? this.accountSelectorService.selectedAccount.displayName
            : this.accountSelectorService.userInfo.fullName;
    }

    loadOrgUnits(searchValue?: string): Observable<OrganizationUnitShortDto[]> {
        this.searchValue = searchValue;
        return this.accountSelectorService.getOrgUnits(searchValue);
    }

    onSearchChanged = (event) => {
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(() => {
            let searchValue = event.component.option('value');
            if (this.searchValue != searchValue) {
                this.searchValue = searchValue;
                abp.ui.setBusy(this.listComponent.element());
                this.loadOrgUnits(searchValue).subscribe((organizationUnits: OrganizationUnitShortDto[]) => {
                    this.updateItemsList(organizationUnits);
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
        this.updateItemsList(this.accountSelectorService.initialOrgUnits);
    }

    updateItemsList(items) {
        let allDisplayName = this.ls.l('All') + ' ' + this.ls.l('OrganizationUnits'),
            maxWidth = items.reduce((acc, item) => {
                if (acc < item.displayName.length)
                    return item.displayName.length;
                return acc;
            }, allDisplayName.length) * this.symbolWidth;

        if (maxWidth > this.minWidth && maxWidth < this.maxWidth)
            this.dropDownWidth = maxWidth;
        else if (maxWidth < this.minWidth)
            this.dropDownWidth = this.minWidth;
        else if (maxWidth > this.maxWidth)
            this.dropDownWidth = this.maxWidth;

        this.listComponent.option('items', [
            new OrganizationUnitShortDto({
                id: -1,
                displayName: allDisplayName,
                parentId: undefined
            }),
            ...items
        ]);
    }
}