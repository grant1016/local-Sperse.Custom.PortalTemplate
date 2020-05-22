import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { AutoLoginComponent } from './auto-login/auto-login.component';
//import { BuyComponent } from './payment/buy.component';
//import { UpgradeOrExtendComponent } from './payment/upgrade-or-extend.component';
import { ForgotPasswordComponent } from './password/forgot-password.component';
import { ResetPasswordComponent } from './password/reset-password.component';
import { EmailActivationComponent } from './email-activation/email-activation.component';
import { ConfirmEmailComponent } from './email-activation/confirm-email.component';
import { SendTwoFactorCodeComponent } from './login/send-two-factor-code.component';
import { ValidateTwoFactorCodeComponent } from './login/validate-two-factor-code.component';
import { SelectTenantComponent } from './login/select-tenant.component';
import { AccountComponent } from './account.component';
import { SignupComponent } from './signup/signup.component';

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '',
                component: AccountComponent,
                children: [
                    { path: 'login', component: LoginComponent },
                    { path: 'auto-login', component: AutoLoginComponent },
//                    { path: 'buy', component: BuyComponent },
//                    { path: 'extend', component: UpgradeOrExtendComponent },
//                    { path: 'upgrade', component: UpgradeOrExtendComponent },
                    { path: 'forgot-password', component: ForgotPasswordComponent },
                    { path: 'reset-password', component: ResetPasswordComponent },
                    { path: 'email-activation', component: EmailActivationComponent },
                    { path: 'confirm-email', component: ConfirmEmailComponent },
                    { path: 'send-code', component: SendTwoFactorCodeComponent },
                    { path: 'verify-code', component: ValidateTwoFactorCodeComponent },
                    { path: 'select-tenant', component: SelectTenantComponent },
                    { path: 'signup', component: SignupComponent }
                ]
            }
        ])
    ],
    exports: [
        RouterModule
    ]
})
export class AccountRoutingModule { }