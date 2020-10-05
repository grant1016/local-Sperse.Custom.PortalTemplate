/** Core imports */
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';

/** Third party imports */
import { MatDialog } from '@angular/material/dialog';

/** Application imports */
import { AppLocalizationService } from '@app/shared/common/localization/app-localization.service';
import { WithdrawalDialogComponent } from '@shared/common/referral/commission-amounts/withdrawal-dialog/withdrawal-dialog.component';
import { GetLedgerTotalsOutput } from '@shared/service-proxies/service-proxies';
import { ReferralService } from '@shared/common/referral/referral.service';

@Component({
    selector: 'commission-amounts',
    templateUrl: 'commission-amounts.component.html',
    styleUrls: [ 'commission-amounts.component.less' ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CommissionAmountsComponent implements OnInit {
    ledgerTotals: GetLedgerTotalsOutput;
    constructor(
        private dialog: MatDialog,
        private referralService: ReferralService,
        private changeDetectorRef: ChangeDetectorRef,
        public ls: AppLocalizationService
    ) {}

    ngOnInit() {
        this.referralService.ledgerTotals$.subscribe((ledgerTotals: GetLedgerTotalsOutput) => {
            this.ledgerTotals = ledgerTotals;
            this.changeDetectorRef.detectChanges();
        })
    }

    requestWithdrawal() {
        this.dialog.open(WithdrawalDialogComponent);
    }
}