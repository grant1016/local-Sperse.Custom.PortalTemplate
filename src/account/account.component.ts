/** Core imports */
import { Component, ViewEncapsulation, OnInit } from '@angular/core';

/** Third party imports */
import * as moment from 'moment';

/** Application imports */
import { AppSessionService } from '@shared/common/session/app-session.service';
import { AppConsts } from '@shared/AppConsts';
import { AppLocalizationService } from '@app/shared/common/localization/app-localization.service';
import { environment } from '@root/environments/environment';

@Component({
    templateUrl: './account.component.html',
    styleUrls: [
        '../shared/common/styles/core.less',
        './account.component.less'
    ],
    encapsulation: ViewEncapsulation.None
})
export class AccountComponent implements OnInit {
    currentYear: number = moment().year();
    tenantName = AppConsts.defaultTenantName;
    remoteServiceBaseUrl = AppConsts.remoteServiceBaseUrl;
    originUrl = location.origin;

    constructor(
        public appSession: AppSessionService,
        public ls: AppLocalizationService
    ) {}

    ngOnInit(): void {
        if (abp.session.multiTenancySide == abp.multiTenancy.sides.HOST)
            this.originUrl = environment.publicUrl;
    }
}