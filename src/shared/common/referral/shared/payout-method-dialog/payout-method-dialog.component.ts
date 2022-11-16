/** Core imports */
import { Component, Inject, ViewChild, ElementRef } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';

/** Third party imports */
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { first, finalize } from 'rxjs/operators';
import { Observable } from 'rxjs';

/** Application imports */
import { AppConsts } from '@shared/AppConsts';
import { AppLocalizationService } from '@app/shared/common/localization/app-localization.service';
import {
    AffiliatePayoutSettingInfo,
    AffiliatePayoutServiceProxy,
    AffiliatePayoutSettingInput,
    CommissionServiceProxy,
    PaymentSettingType
} from '@shared/service-proxies/service-proxies';
import { ReferralService } from '@shared/common/referral/referral.service';
import { LoadingService } from '@shared/common/loading-service/loading.service';
import { MessageService } from 'abp-ng2-module';

@Component({
    selector: 'payout-method-dialog',
    templateUrl: './payout-method-dialog.component.html',
    styleUrls: ['./payout-method-dialog.component.less'],
    providers: [CommissionServiceProxy]
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
    paymentTypes$: Observable<PaymentSettingType[]> = this.commissionProxy.getAvailablePayoutTypes();
    setting: AffiliatePayoutSettingInfo = new AffiliatePayoutSettingInfo();
    settings: AffiliatePayoutSettingInfo[];
    type: PaymentSettingType;

    constructor(
        private dialog: MatDialog,
        private elementRef: ElementRef,
        private message: MessageService,
        public ls: AppLocalizationService,
        private loadingService: LoadingService,
        public referralService: ReferralService,
        private commissionProxy: CommissionServiceProxy,
        public paymentProxy: AffiliatePayoutServiceProxy,
        public dialogRef: MatDialogRef<PayoutMethodDialogComponent>
    ) {
        this.setting.isDefault = true;
        this.type = PaymentSettingType.PayPal;
        this.referralService.affiliatePaymentSettings$.pipe(
            first()
        ).subscribe((settings: AffiliatePayoutSettingInfo[]) => {
            if (settings && settings.length)
                this.settings = settings;
                settings.some((setting: AffiliatePayoutSettingInfo) => {
                    if (setting.isDefault) {
                        this.type = setting.type;
                        this.setting = setting;
                    }
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
            this.clearBankTransferFields();

        } else if (this.setting.type == PaymentSettingType.BankTransfer) {
            if (!this.bankAccountNumber.valid) {
                this.bankAccountNumber.markAsTouched();
                return abp.notify.error(this.ls.l('RequiredField', 'BankAccountNumber'));
            }
            this.setting.emailAddress = undefined;
        } else {
            this.setting.emailAddress = undefined;
            this.clearBankTransferFields();
        }

        this.startLoading();
        this.setting.isDefault = true;
        this.paymentProxy.createOrUpdate(
            new AffiliatePayoutSettingInput(this.setting)
        ).pipe(
            finalize(() => this.finishLoading())
        ).subscribe(() => {
            abp.notify.success(this.ls.l('SavedSuccessfully'));
            this.referralService.refreshPaymentSettings();
            this.close();
        });
    }

    clearBankTransferFields() {
        this.setting.paymentCurrency = undefined;
        this.setting.accountName = undefined;
        this.setting.bankCode = undefined;
        this.setting.accountNumber = undefined;
        this.setting.iban = undefined;
        this.setting.nationalIDNumber = undefined;
        this.setting.taxID = undefined;
        this.setting.swift = undefined;
        this.setting.bankName = undefined;
        this.setting.bankAddress = undefined;
        this.setting.bankAddress2 = undefined;
        this.setting.bankCity = undefined;
        this.setting.bankState = undefined;
        this.setting.bankZip = undefined;
        this.setting.country = undefined;
        this.setting.intermediarySwift = undefined;
        this.setting.intermediaryBankName = undefined;
        this.setting.intermediaryBankCountry = undefined;
        this.setting.intermediaryBankCity = undefined;
        this.setting.intermediaryAccountNumber = undefined;
    }

    close(): void {
        this.dialogRef.close();
    }

    connectStripeAccount() {
        this.message.confirm('', this.ls.l('PaymentMethodDialog.ConnectStripeAccountConfirmation'), (isConfirmed) => {
            console.log(isConfirmed);
            if (isConfirmed) {
                this.startLoading();
                this.paymentProxy.connectStripeAccount()
                .pipe(
                    finalize(() => this.finishLoading())
                ).subscribe((url) => {
                    window.location.href = url;
                });
            }
        });
    }

    onTypeChanged() {
        let setting = this.settings.find(item => item.type == this.type);
        if (setting)
            setTimeout(() => this.setting = setting, 100);
        else {
            this.setting = new AffiliatePayoutSettingInfo();
            this.setting.type = this.type;
            this.setting.isDefault = true;
        }
    }
}