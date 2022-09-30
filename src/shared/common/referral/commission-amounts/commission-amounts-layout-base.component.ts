/** Core imports */
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';

/** Third party imports */
import { MatDialog } from '@angular/material/dialog';
import { first } from 'rxjs/operators';

/** Application imports */
import { AppLocalizationService } from '@app/shared/common/localization/app-localization.service';
import { WithdrawalDialogComponent } from '@shared/common/referral/commission-amounts/withdrawal-dialog/withdrawal-dialog.component';
import { AffiliatePaymentSettingInfo, GetLedgerTotalsOutput, PaymentSettingType } from '@shared/service-proxies/service-proxies';
import { AppSessionService } from '@shared/common/session/app-session.service';
import { ReferralService } from '@shared/common/referral/referral.service';

@Component({
    selector: 'commission-amounts-layout-base',
    templateUrl: 'commission-amounts-layout-base.component.html',
    styleUrls: [ 'commission-amounts-layout-base.component.less' ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CommissionAmountsLayoutBaseComponent implements OnInit {
    ledgerTotals: GetLedgerTotalsOutput;
    paymentSettingType = PaymentSettingType;
    paymentSetting: AffiliatePaymentSettingInfo;

    constructor(
        private dialog: MatDialog,
        private referralService: ReferralService,
        private changeDetectorRef: ChangeDetectorRef,
        public appSessionService: AppSessionService,
        public ls: AppLocalizationService
    ) {
        this.referralService.affiliatePaymentSettings$.pipe(
            first()
        ).subscribe((settings: AffiliatePaymentSettingInfo[]) => {
            if (settings && settings.length)
                settings.some((setting: AffiliatePaymentSettingInfo) => {
                    if (setting.isDefault)
                        this.paymentSetting = setting;
                });
            this.changeDetectorRef.detectChanges();
        });
    }

    ngOnInit() {
        this.referralService.ledgerTotals$.subscribe((ledgerTotals: GetLedgerTotalsOutput) => {
            this.ledgerTotals = ledgerTotals;
            this.changeDetectorRef.detectChanges();
        })
    }

    requestWithdrawal() {
        this.dialog.open(WithdrawalDialogComponent, {
            data: {
                availableBalance: this.ledgerTotals.availableBalance
            }
        });
    }
}