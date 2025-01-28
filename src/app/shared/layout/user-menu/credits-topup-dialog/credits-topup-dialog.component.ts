/** Core imports */
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

/** Third party imports */
import { DxValidatorComponent } from 'devextreme-angular/ui/validator';
import { Observable, of } from 'rxjs';
import { finalize, map, tap } from 'rxjs/operators';

/** Application imports */
import { AppLocalizationService } from '@app/shared/common/localization/app-localization.service';
import { MemberCreditServiceProxy, PaymentDataInput, PaypalSettingsInfo, StripeSettingsInfo } from '@shared/service-proxies/service-proxies';
import { LoadingService } from '@shared/common/loading-service/loading.service';
import { AppSessionService } from '@root/shared/common/session/app-session.service';
import { AppConsts } from '@root/shared/AppConsts';
import { ProfileService } from '@root/shared/common/profile-service/profile.service';
import { PayPalComponent } from '@root/shared/common/paypal/paypal.component';
import { ButtonType } from '@root/shared/common/paypal/button-type.enum';

@Component({
    selector: 'credits-topup-dialog',
    templateUrl: 'credits-topup-dialog.component.html',
    styleUrls: [ 'credits-topup-dialog.component.less' ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreditsTopupDialogComponent implements OnInit {
    private payPal: PayPalComponent;
    @ViewChild(PayPalComponent) set paypPalComponent(paypalComp: PayPalComponent) {
        this.payPal = paypalComp;
        this.initializePayPal();
    };
    @ViewChild(DxValidatorComponent) validator: DxValidatorComponent;
    quantity: number = 1;
    currencyId = this.data.currencyId;

    availablePaymentsInfo: { stripeInfo: StripeSettingsInfo, paypalInfo: PaypalSettingsInfo };
    initialInvoiceXref: string;

    constructor(
        private dialog: MatDialogRef<CreditsTopupDialogComponent>,
        private appSession: AppSessionService,
        private memberCreditService: MemberCreditServiceProxy,
        private elementRef: ElementRef,
        private loadingService: LoadingService,
        private profileService: ProfileService,
        private changeDetector: ChangeDetectorRef,
        public ls: AppLocalizationService,
        @Inject(MAT_DIALOG_DATA) public data: { rate: number, currencyId: string }
    ) {}

    ngOnInit() {
        this.profileService.availablePaymentMethods$
            .subscribe(res =>  {
                this.availablePaymentsInfo = res;
                this.initializePayPal();
                this.changeDetector.detectChanges();
            });
    }

    initializePayPal() {
        if (this.availablePaymentsInfo && this.payPal && this.availablePaymentsInfo.paypalInfo.isEnabled && !this.payPal.initialized) {
            this.payPal.initialize(this.availablePaymentsInfo.paypalInfo.clientId, ButtonType.Payment,
                () => this.getSubmitRequest('PayPal').pipe(map(v => v.paymentData)).toPromise(),
                null,
                this.currencyId
            );
        }
    }

    submitStripeRequest() {
        if (!this.validator.instance.validate().isValid)
            return;

        this.loadingService.startLoading(this.elementRef.nativeElement);
        this.getSubmitRequest('Stripe').pipe(
            finalize(() => this.loadingService.finishLoading(this.elementRef.nativeElement))
        ).subscribe((res) => {
            location.href = res.paymentData;
        });
    }

    getSubmitRequest(paymentGateway: string): Observable<any> {
        if (!this.validator.instance.validate().isValid)
            return of();

        return this.memberCreditService.prepareTopUpPaymentData(new PaymentDataInput({
            quantity: this.quantity,
            paymentGateway: paymentGateway,
            successUrl: `${AppConsts.remoteServiceBaseUrl}/receipt/${this.appSession.tenantId || 0}/{initialInvoiceXref}?usePortal=1`,
            cancelUrl: location.href
        })).pipe(
            tap(v => { this.initialInvoiceXref = v.initialInvoicePublicId })
        );
    }

    onPayPalApprove() {
        location.href = this.getReceiptUrl();
    }

    getReceiptUrl() {
        return `${AppConsts.remoteServiceBaseUrl}/receipt/${this.appSession.tenantId || 0}/${this.initialInvoiceXref}?usePortal=1`;
    }

    closeDialog() {
        this.dialog.close();
    }
}