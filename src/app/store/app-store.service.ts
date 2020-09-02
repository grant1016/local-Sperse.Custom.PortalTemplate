/** Core imports */
import { Injectable } from '@angular/core';

/** Third party imports */
import { Store, select } from '@ngrx/store';

/** Application imports */
import {
    ListsStoreActions,
    StarsStoreActions,
    StatusesStoreActions,
    TagsStoreActions,
} from '@app/store/index';
import { AppStore } from './index';
import { AppPermissionService } from '@shared/common/auth/permission.service';
import { AppPermissions } from '@shared/AppPermissions';

@Injectable()
export class AppStoreService {
    constructor(
        private store$: Store<AppStore.State>,
        private permission: AppPermissionService
    ) {}

    loadUserDictionaries() {
        if (this.permission.isGranted(AppPermissions.CRM)
            &&  this.permission.isGranted(AppPermissions.CRMCustomers)
        ) {
            this.store$.dispatch(new StarsStoreActions.LoadRequestAction(false));
            this.store$.dispatch(new StatusesStoreActions.LoadRequestAction(false));
            this.store$.dispatch(new TagsStoreActions.LoadRequestAction(false));
            this.store$.dispatch(new ListsStoreActions.LoadRequestAction(false));
        }
    }
}
