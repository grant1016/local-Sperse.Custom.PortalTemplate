import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { AutoLoginComponent } from './auto-login/auto-login.component';
//import { ForgotPasswordComponent } from './password/forgot-password.component';
import { CombinedForgotPasswordComponent } from './password/combined-forgot-password.component';
import { ResetPasswordComponent } from './password/reset-password.component';
import { EmailActivationComponent } from './email-activation/email-activation.component';
import { ConfirmEmailComponent } from './email-activation/confirm-email.component';
import { SendTwoFactorCodeComponent } from './login/send-two-factor-code.component';
import { ValidateTwoFactorCodeComponent } from './login/validate-two-factor-code.component';
import { SelectTenantComponent } from './login/select-tenant.component';
import { AccountComponent } from './account.component';
import { SignupComponent } from './signup/signup.component';
import { OAuthRedirectComponent } from './oauth-redirect/oauth-redirect.component';

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '',
                component: AccountComponent,
                children: [
                    { path: 'login', component: LoginComponent },
                    { path: 'auto-login', component: AutoLoginComponent },
                    { path: 'forgot-password', component: CombinedForgotPasswordComponent },
                    { path: 'reset-password', component: ResetPasswordComponent },
                    { path: 'email-activation', component: EmailActivationComponent },
                    { path: 'confirm-email', component: ConfirmEmailComponent },
                    { path: 'send-code', component: SendTwoFactorCodeComponent },
                    { path: 'verify-code', component: ValidateTwoFactorCodeComponent },
                    { path: 'select-tenant', component: SelectTenantComponent },
                    //{ path: 'signup', component: SignupComponent }
                    { path: 'oauth-redirect', component: OAuthRedirectComponent }
                ]
            }
        ])
    ],
    exports: [
        RouterModule
    ]
})
export class AccountRoutingModule { }