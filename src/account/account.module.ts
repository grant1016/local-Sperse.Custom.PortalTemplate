import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UtilsModule } from '@shared/utils/utils.module';
import { ModalModule } from 'ngx-bootstrap/modal';
import { AccountRoutingModule } from './account-routing.module';
import { SignupModule } from './signup/signup.module';
import { AccountComponent } from './account.component';
import { AutoLoginComponent } from './auto-login/auto-login.component';
import { ConfirmEmailComponent } from './email-activation/confirm-email.component';
import { EmailActivationComponent } from './email-activation/email-activation.component';
import { LanguageSwitchComponent } from './language-switch.component';
import { LoginComponent } from './login/login.component';
import { LoginService } from './login/login.service';
import { SendTwoFactorCodeComponent } from './login/send-two-factor-code.component';
import { ValidateTwoFactorCodeComponent } from './login/validate-two-factor-code.component';
import { ForgotPasswordComponent } from './password/forgot-password.component';
import { ResetPasswordComponent } from './password/reset-password.component';
import { TenantChangeModalComponent } from './shared/tenant-change-modal.component';
import { TenantChangeComponent } from './shared/tenant-change.component';
import { SelectTenantComponent } from './login/select-tenant.component';
import { ApplicationServiceProxy } from '@shared/service-proxies/service-proxies';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        SignupModule,
        ModalModule.forRoot(),
        UtilsModule,
        AccountRoutingModule,
        TranslateModule.forChild({
            extend: true
        })
    ],
    declarations: [
        AccountComponent,
        AutoLoginComponent,
        TenantChangeComponent,
        TenantChangeModalComponent,
        LoginComponent,
        ForgotPasswordComponent,
        ResetPasswordComponent,
        EmailActivationComponent,
        ConfirmEmailComponent,
        SendTwoFactorCodeComponent,
        ValidateTwoFactorCodeComponent,
        SelectTenantComponent,
        LanguageSwitchComponent
    ],
    entryComponents: [
    ],
    providers: [
        LoginService,
        ApplicationServiceProxy
    ]
})
export class AccountModule {}
