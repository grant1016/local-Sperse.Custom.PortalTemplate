import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppLocalizationService } from '@app/shared/common/localization/app-localization.service';
import { MatDialog } from '@angular/material/dialog';
import { WithdrawalDialogComponent } from '@shared/common/referral/commission-amounts/withdrawal-dialog/withdrawal-dialog.component';

@Component({
    selector: 'commission-amounts',
    templateUrl: 'commission-amounts.component.html',
    styleUrls: [ 'commission-amounts.component.less' ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CommissionAmountsComponent {
    constructor(
        private dialog: MatDialog,
        public ls: AppLocalizationService
    ) {}

    requestWithdrawal() {
        this.dialog.open(WithdrawalDialogComponent);
    }
}