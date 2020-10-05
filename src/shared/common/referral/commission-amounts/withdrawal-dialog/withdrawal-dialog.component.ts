import { ChangeDetectionStrategy, Component, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DxValidatorComponent } from 'devextreme-angular/ui/validator';
import { NotifyService } from '@abp/notify/notify.service';
import { AppLocalizationService } from '@app/shared/common/localization/app-localization.service';

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
        public ls: AppLocalizationService,
        @Inject(MAT_DIALOG_DATA) public data: { availableBalance: number }
    ) {}

    save() {
        if (this.validator.instance.validate().isValid) {
            this.notifyService.success(this.ls.l('Referral.ThanksForRequest'));
            this.dialog.close();
        }
    }

    reset() {
        this.withdrawalAmount = null;
    }
}