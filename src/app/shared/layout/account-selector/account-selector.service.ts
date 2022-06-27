/** Core imports */
import { Injectable } from '@angular/core';

/** Third party imports */
import { Observable, ReplaySubject, of } from '@node_modules/rxjs';

/** Application imports */
import { AppPermissions } from '@shared/AppPermissions';
import { AppPermissionService } from '@shared/common/auth/permission.service';
import { AppSessionService, ILoginInfo } from '@shared/common/session/app-session.service';
import { DictionaryServiceProxy, OrganizationUnitShortDto } from '@shared/service-proxies/service-proxies';

@Injectable()
export class AccountSelectorService {
    selectedOrgUnitIds: ReplaySubject<number[]> = new ReplaySubject<number[]>(1);
    selectedOrgUnitIds$: Observable<number[]> = this.selectedOrgUnitIds.asObservable();

    userInfo: ILoginInfo = this.appSessionService.getShownLoginInfo();
    initialOrgUnits: OrganizationUnitShortDto[];
    selectedAccount: OrganizationUnitShortDto;
    showLoadingSpinner = true;

    constructor(
        private appSessionService: AppSessionService,
        private permissionService: AppPermissionService,
        public dictionaryProxy: DictionaryServiceProxy
    ) {
        this.getOrgUnits().subscribe((data: OrganizationUnitShortDto[])  => {
            if (!this.selectedAccount) {
                this.initialOrgUnits = data;
                if (data.length) {
                    this.selectedAccount = data[0];
                    this.selectedOrgUnitIds.next([this.selectedAccount.id]);
                } else {
                    this.selectedAccount = new OrganizationUnitShortDto({
                        id: this.userInfo.contactId,
                        displayName: this.userInfo.fullName,
                        parentId: null
                    });
                    this.selectedOrgUnitIds.next([]);
                }
            }
            this.showLoadingSpinner = false;
        });
    }

    getOrgUnits(search?: string): Observable<OrganizationUnitShortDto[]> {
        return this.permissionService.isGranted(AppPermissions.CRM) ?
            this.dictionaryProxy.getOrganizationUnits(search, 50, true) : of([]);
    }
}
