/** Core imports */
import {
    ChangeDetectionStrategy,
    Component,
    OnInit,
    ViewChild,
    ViewContainerRef
} from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';

/** Third party imports */
import { MatDialog } from '@angular/material/dialog';
import { first } from 'rxjs/operators';
import * as moment from 'moment';

/** Application imports */
import { AppConsts } from '@shared/AppConsts';
import { AbpSessionService } from 'abp-ng2-module';
import { ConditionsType } from '@shared/AppEnums';
import { accountModuleAnimation } from '@shared/animations/routerTransition';
import { SessionServiceProxy, UpdateUserSignInTokenOutput } from '@shared/service-proxies/service-proxies';
import { UrlHelper } from '@shared/helpers/UrlHelper';
import { ExternalLoginProvider, LoginService } from './login.service';
import { SettingService } from 'abp-ng2-module';
import { AppSessionService } from '@shared/common/session/app-session.service';
import { AppLocalizationService } from '@app/shared/common/localization/app-localization.service';
import { ConditionsModalComponent } from '@shared/common/conditions-modal/conditions-modal.component';

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
        public dialog: MatDialog,
        private sessionService: AbpSessionService,
        private sessionAppService: SessionServiceProxy,
        private setting: SettingService,
        private appSession: AppSessionService,
        private activatedRoute: ActivatedRoute,
        public loginService: LoginService,
        public ls: AppLocalizationService
    ) {
        this.activatedRoute.queryParamMap.pipe(
            first()
        ).subscribe((paramsMap: ParamMap) => {
            let email = paramsMap.get('email');
            if (email)
                this.loginService.authenticateModel.userNameOrEmailAddress = email;
        });
    }

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
        this.dialog.open(ConditionsModalComponent, { panelClass: ['slider', 'footer-slider'], data: { type: type }});
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
        if (event.currentTarget.text) event.currentTarget.text = this.ls.l((this.showPassword ? 'Hide' : 'Show'));
        this.showPassword
            ? event.currentTarget.classList.add('visible')
            : event.currentTarget.classList.remove('visible');
    }
}
