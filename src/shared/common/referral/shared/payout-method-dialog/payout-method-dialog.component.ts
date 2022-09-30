/** Core imports */
import { Component, Inject, ViewChild, ElementRef } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';

/** Third party imports */
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { first, finalize } from 'rxjs/operators';

/** Application imports */
import { AppConsts } from '@shared/AppConsts';
import { AppLocalizationService } from '@app/shared/common/localization/app-localization.service';
import { 
    AffiliatePaymentSettingInfo, 
    AffiliatePaymentServiceProxy, 
    AffiliatePaymentSettingInput, 
    PaymentSettingType 
} from '@shared/service-proxies/service-proxies';
import { ReferralService } from '@shared/common/referral/referral.service';
import { LoadingService } from '@shared/common/loading-service/loading.service';

@Component({
    selector: 'payout-method-dialog',
    templateUrl: './payout-method-dialog.component.html',
    styleUrls: ['./payout-method-dialog.component.less']
})
export class PayoutMethodDialogComponent {
    bankAccountNumber = new FormControl(
        '', [
            Validators.required
        ]
    );
    email = new FormControl(
        '', [
            Validators.required,
            Validators.pattern(AppConsts.regexPatterns.email)
        ]
    );

    paymentSettingType = PaymentSettingType;
    paymentTypes = [PaymentSettingType.PayPal, PaymentSettingType.BankTransfer];
    setting: AffiliatePaymentSettingInfo = new AffiliatePaymentSettingInfo();

    constructor(
        private dialog: MatDialog,
        private elementRef: ElementRef,
        public ls: AppLocalizationService,
        private loadingService: LoadingService,
        public referralService: ReferralService,
        public paymentProxy: AffiliatePaymentServiceProxy,
        public dialogRef: MatDialogRef<PayoutMethodDialogComponent>
    ) {
        this.setting.isDefault = true;
        this.setting.type = PaymentSettingType.PayPal;
        this.referralService.affiliatePaymentSettings$.pipe(
            first()
        ).subscribe((settings: AffiliatePaymentSettingInfo[]) => {
            if (settings && settings.length)
                settings.some((setting: AffiliatePaymentSettingInfo) => {
                    if (setting.isDefault)
                        this.setting = setting;
                });
        });
    }

    startLoading() {
        this.loadingService.startLoading(this.elementRef.nativeElement);
    }

    finishLoading() {
        this.loadingService.finishLoading(this.elementRef.nativeElement);
    }

    update() {
        if (this.setting.type == PaymentSettingType.PayPal) {
            if (!this.email.valid) {
                this.email.markAsTouched();
                return abp.notify.error(this.ls.l('InvalidFieldValue', 'Email'));
            }
            
            this.setting.beneficiaryName = undefined;
            this.setting.beneficiaryStreetAddress = undefined;
            this.setting.beneficiaryCityAddress = undefined;
            this.setting.beneficiaryBankName = undefined;
            this.setting.beneficiaryBankStreetAddress = undefined;
            this.setting.beneficiaryBankCityAddress = undefined;
            this.setting.bankAccountNumber = undefined;
            this.setting.bankRoutingNumberForACH = undefined;
            this.setting.bankRoutingNumber = undefined;
            this.setting.swiftCodeForUSDollar = undefined;
            this.setting.swiftCode = undefined;
        } else {
            if (!this.bankAccountNumber.valid) {
                this.bankAccountNumber.markAsTouched();
                return abp.notify.error(this.ls.l('FieldRequired', 'BankAccountNumber'));
            }
            this.setting.emailAddress = undefined;
        }

        this.startLoading();
        this.setting.isDefault = true;
        this.paymentProxy.createOrUpdate(
            new AffiliatePaymentSettingInput(this.setting)
        ).pipe(
            finalize(() => this.finishLoading())
        ).subscribe(() => {
            abp.notify.success(this.ls.l('SavedSuccessfully'));
            this.referralService.refreshPaymentSettings();
            this.close();
        });
    }

    close(): void {
        this.dialogRef.close();
    }
}