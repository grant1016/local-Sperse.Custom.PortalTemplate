/** Core imports */
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, OnDestroy } from '@angular/core';

/** Third party imports */
import { MatDialog } from '@angular/material/dialog';
import { takeUntil } from 'rxjs/operators';

/** Application imports */
import { AppLocalizationService } from '@app/shared/common/localization/app-localization.service';
import { LifecycleSubjectsService } from '@shared/common/lifecycle-subjects/lifecycle-subjects.service';
import { PayoutMethodDialogComponent } from '../shared/payout-method-dialog/payout-method-dialog.component';
import { WithdrawalDialogComponent } from '@shared/common/referral/commission-amounts/withdrawal-dialog/withdrawal-dialog.component';
import { AffiliatePayoutSettingInfo, GetLedgerTotalsOutput, PaymentSettingType } from '@shared/service-proxies/service-proxies';
import { AppSessionService } from '@shared/common/session/app-session.service';
import { ReferralService } from '@shared/common/referral/referral.service';

@Component({
    selector: 'commission-amounts-layout-base',
    templateUrl: 'commission-amounts-layout-base.component.html',
    styleUrls: [ 'commission-amounts-layout-base.component.less' ],
    providers: [LifecycleSubjectsService],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CommissionAmountsLayoutBaseComponent implements OnInit, OnDestroy {
    ledgerTotals: GetLedgerTotalsOutput;
    paymentSettingType = PaymentSettingType;
    paymentSetting: AffiliatePayoutSettingInfo;

    constructor(
        private dialog: MatDialog,
        private referralService: ReferralService,
        private changeDetectorRef: ChangeDetectorRef,
        private lifeCycleSubject: LifecycleSubjectsService,
        public appSessionService: AppSessionService,
        public ls: AppLocalizationService
    ) {
        this.referralService.affiliatePaymentSettings$.pipe(
            takeUntil(this.lifeCycleSubject.deactivate$)
        ).subscribe((settings: AffiliatePayoutSettingInfo[]) => {
            if (settings && settings.length)
                settings.some((setting: AffiliatePayoutSettingInfo) => {
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

    showPayoutMethodDialog() {
        this.dialog.open(PayoutMethodDialogComponent, {
            width: '420px'
        });
    }

    ngOnDestroy() {
        this.lifeCycleSubject.deactivate.next();
    }
}