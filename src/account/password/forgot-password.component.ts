/**  Core imports */
import {
    Component,
    OnInit,
    ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';

/** Application imports */
import { SendPasswordResetCodeInput } from '@shared/service-proxies/service-proxies';
import { accountModuleAnimation } from '@shared/animations/routerTransition';
import { LoginService } from 'account/login/login.service';
import { AppConsts } from '@shared/AppConsts';
import { AppLocalizationService } from '@app/shared/common/localization/app-localization.service';

@Component({
    templateUrl: './forgot-password.component.html',
    styleUrls: [
        './forgot-password.component.less'
    ],
    animations: [accountModuleAnimation()]
})
export class ForgotPasswordComponent implements OnInit {
    @ViewChild('forgotPassForm', { static: false }) form;
    model: SendPasswordResetCodeInput = new SendPasswordResetCodeInput();
    saving = false;
    emailRegex = AppConsts.regexPatterns.email;

    constructor (
        private router: Router,
        private loginService: LoginService,
        public ls: AppLocalizationService
    ) {}

    ngOnInit() {}

    autoLogin() {
        if (this.form.valid)
            this.router.navigate(['account/auto-login'], 
                {queryParams: {email: this.model.emailAddress, instant: true}}
            )
    }

    save(): void {
        if (this.form.valid) {
            this.saving = true;
            this.loginService.resetPasswordModel = this.model;
            this.loginService.sendPasswordResetCode(() => this.saving = false, true);
        }
    }
}
