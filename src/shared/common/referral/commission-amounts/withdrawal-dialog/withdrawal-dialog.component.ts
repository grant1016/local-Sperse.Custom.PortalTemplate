/** Core imports */
import { ChangeDetectionStrategy, Component, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

/** Third party imports */
import { DxValidatorComponent } from 'devextreme-angular/ui/validator';

/** Application imports */
import { NotifyService } from '@abp/notify/notify.service';
import { AppLocalizationService } from '@app/shared/common/localization/app-localization.service';
import { UserCommissionServiceProxy } from '@shared/service-proxies/service-proxies';
import { ReferralService } from '@shared/common/referral/referral.service';

@Component({
    selector: 'withdrawal-dialog-component',
    templateUrl: 'withdrawal-dialog.component.html',
    styleUrls: [ 'withdrawal-dialog.component.less' ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class WithdrawalDialogComponent {
    @ViewChild(DxValidatorComponent, { static: false }) validator: DxValidatorComponent;
    withdrawalAmount: number;
    constructor(
        private dialog: MatDialogRef<WithdrawalDialogComponent>,
        private notifyService: NotifyService,
        private userCommissionServiceProxy: UserCommissionServiceProxy,
        private referralService: ReferralService,
        public ls: AppLocalizationService,
        @Inject(MAT_DIALOG_DATA) public data: { availableBalance: number }
    ) {}

    save() {
        if (this.validator.instance.validate().isValid) {
            this.userCommissionServiceProxy.requestWithdrawal(
                this.withdrawalAmount
            ).subscribe(() => {
                this.referralService.refresh();
                this.notifyService.success(this.ls.l('Referral.ThanksForRequest'));
                this.dialog.close();
            });
        }
    }

    reset() {
        this.withdrawalAmount = null;
    }
}