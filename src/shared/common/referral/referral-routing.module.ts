import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ReferralComponent } from '@shared/common/referral/referral.component';

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '',
                component: ReferralComponent
            }
        ])
    ],
    exports: [RouterModule],
    providers: []
})
export class ReferralRoutingModule { }
