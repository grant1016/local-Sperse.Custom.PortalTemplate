/** Core imports */
import {
    ChangeDetectionStrategy,
    Component,
    OnInit,
    ViewChild,
    ViewContainerRef
} from '@angular/core';

/** Third party imports */
import * as moment from 'moment';

/** Application imports */
import { AppConsts } from '@shared/AppConsts';
import { AbpSessionService } from '@abp/session/abp-session.service';
import { ConditionsType } from '@shared/AppEnums';
import { accountModuleAnimation } from '@shared/animations/routerTransition';
import { SessionServiceProxy, UpdateUserSignInTokenOutput } from '@shared/service-proxies/service-proxies';
import { UrlHelper } from '@shared/helpers/UrlHelper';
import { ExternalLoginProvider, LoginService } from './login.service';
import { SettingService } from '@abp/settings/setting.service';
import { AppSessionService } from '@shared/common/session/app-session.service';
import { AppLocalizationService } from '@app/shared/common/localization/app-localization.service';

export class AdLoginHostDirective {
    constructor(public viewContainerRef: ViewContainerRef) { }
}

@Component({
    templateUrl: './login.component.html',
    styleUrls: [ './login.component.less' ],
    animations: [accountModuleAnimation()],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent implements OnInit {
    @ViewChild('loginForm', { static: false }) loginForm;
    currentYear: number = moment().year();
    tenantName = AppConsts.defaultTenantName;
    conditions = ConditionsType;
    loginInProgress = false;
    showPassword = false;

    constructor(
        private sessionService: AbpSessionService,
        private sessionAppService: SessionServiceProxy,
        private setting: SettingService,
        private appSession: AppSessionService,
        public loginService: LoginService,
        public ls: AppLocalizationService
    ) {}

    ngOnInit(): void {
        let tenant = this.appSession.tenant;
        if (tenant)
            this.tenantName = tenant.name || tenant.tenancyName;
        if (this.sessionService.userId > 0 && UrlHelper.getReturnUrl() && UrlHelper.getSingleSignIn()) {
            this.sessionAppService.updateUserSignInToken()
                .subscribe((result: UpdateUserSignInTokenOutput) => {
                    const initialReturnUrl = UrlHelper.getReturnUrl();
                    location.href = initialReturnUrl + (initialReturnUrl.indexOf('?') >= 0 ? '&' : '?') +
                        'accessToken=' + result.signInToken +
                        '&userId=' + result.encodedUserId +
                        '&tenantId=' + result.encodedTenantId;
                });
        }
    }

    openConditionsDialog(type: ConditionsType) {
    }

    login(): void {
        if (this.loginForm.valid) {
            this.loginInProgress = true;
            this.loginService.authenticate(() => { this.loginInProgress = false; });
        }
    }

    externalLogin(provider: ExternalLoginProvider) {
        this.loginService.externalAuthenticate(provider);
    }

    getLoginPlaceholder(): string {
        return abp.session.tenantId ? this.ls.l('UserNameOrEmail') : this.ls.l('EmailAddress');
    }

    showHidePassword(event) {
        this.showPassword = !this.showPassword;
        event.currentTarget.text = this.ls.l((this.showPassword ? 'Hide' : 'Show'));
    }
}
