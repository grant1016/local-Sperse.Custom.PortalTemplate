/** Core imports */
import { Component, Injector } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';

/** Third party imports */
import { MatDialog } from '@angular/material/dialog';
import { finalize, first } from 'rxjs/operators';

/** Application imports */
import { AppConsts } from '@shared/AppConsts';
import { ConditionsType } from '@shared/AppEnums';
import { LoginService } from '../login/login.service';
import { ConditionsModalService } from '@shared/common/conditions-modal/conditions-modal.service';
import { accountModuleAnimation } from '@shared/animations/routerTransition';
import { AppSessionService } from '@shared/common/session/app-session.service';
import { AppLocalizationService } from '@app/shared/common/localization/app-localization.service';
import { UrlHelper } from '@shared/helpers/UrlHelper';
import {
    TenantModel,
    TokenAuthServiceProxy,
    SendAutoLoginLinkInput,
    AccountServiceProxy,
    AuthenticateByCodeModel,
    AuthenticateResultModel
} from '@shared/service-proxies/service-proxies';

@Component({
    templateUrl: 'auto-login.component.html',
    styleUrls: [
        'auto-login.component.less' 
    ],
    animations: [accountModuleAnimation()]
})
export class AutoLoginComponent {
    conditions = ConditionsType;
    detectedTenancies: TenantModel[] = [];
    tenantName = this.appSession.tenant
        ? this.appSession.tenant.name
        : AppConsts.defaultTenantName;
    isLoggedIn: boolean = false;
    isExtLogin: boolean = false; 
    isLinkSent: boolean = false;
    userEmail: string;

    constructor(
        injector: Injector,
        public dialog: MatDialog,
        public ls: AppLocalizationService,
        public conditionsModalService: ConditionsModalService,
        private activatedRoute: ActivatedRoute,
        private accountProxy: AccountServiceProxy,
        private authProxy: TokenAuthServiceProxy,
        private appSession: AppSessionService,
        private loginService: LoginService
    ) {
        this.activatedRoute.queryParams.pipe(first())
            .subscribe((params: Params) => {
                this.userEmail = params.email;
                if (this.userEmail) {
                    setTimeout(() => this.sendloginLink());
                }
            });
    }

    sendloginLink(tenantId?: number): void {
        abp.ui.setBusy();
        if (this.appSession.tenantId)
            tenantId = this.appSession.tenantId;
        abp.multiTenancy.setTenantIdCookie(tenantId);
        this.accountProxy.sendAutoLoginLink(new SendAutoLoginLinkInput({
            emailAddress: this.userEmail,
            autoDetectTenancy: isNaN(tenantId),
            appRoute: this.getAppRoute(),
            features: [],
        })).pipe(
            finalize(() => abp.ui.clearBusy())
        ).subscribe(res => {
            if (res && res.detectedTenancies && res.detectedTenancies.length) {
                this.detectedTenancies = res.detectedTenancies;
                this.isLinkSent = res.detectedTenancies.length == 1;
            } else
                this.isLinkSent = !isNaN(tenantId);
        });
    }

    getAppRoute() {
        let path = UrlHelper.getInitialUrlRelativePath();
        return !path || path.indexOf('auto-login') > 0 || path.indexOf('forgot-password') > 0 ? '' : path;
    }

    openConditionsDialog(type: ConditionsType) {
        this.conditionsModalService.openModal({
            panelClass: ['slider', 'footer-slider'],
            data: { type: type }
        });
    }
}