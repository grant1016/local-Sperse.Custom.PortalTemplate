/** Core imports */
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

/** Third party imports */
import { DxValidatorComponent } from 'devextreme-angular/ui/validator';
import { finalize } from 'rxjs/operators';
import { NotifyService } from 'abp-ng2-module';

/** Application imports */
import { AppLocalizationService } from '@app/shared/common/localization/app-localization.service';
import { MemberCreditServiceProxy, PaymentDataInput } from '@shared/service-proxies/service-proxies';
import { LoadingService } from '@shared/common/loading-service/loading.service';
import { AppSessionService } from '@root/shared/common/session/app-session.service';
import { AppConsts } from '@root/shared/AppConsts';
import { SettingsHelper } from '@app/shared/helpers/settings.helper';

@Component({
    selector: 'credits-topup-dialog',
    templateUrl: 'credits-topup-dialog.component.html',
    styleUrls: [ 'credits-topup-dialog.component.less' ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreditsTopupDialogComponent {
    @ViewChild(DxValidatorComponent) validator: DxValidatorComponent;
    quantity: number = 1;
    currency = SettingsHelper.getCurrency();

    paymentLink;

    constructor(
        private dialog: MatDialogRef<CreditsTopupDialogComponent>,
        private appSession: AppSessionService,
        private memberCreditService: MemberCreditServiceProxy,
        private elementRef: ElementRef,
        private loadingService: LoadingService,
        private notifyService: NotifyService,
        private changeDetectorRef: ChangeDetectorRef,
        public ls: AppLocalizationService,
        @Inject(MAT_DIALOG_DATA) public data: { rate: number }
    ) {}

    save() {
        if (this.validator.instance.validate().isValid) {
            this.loadingService.startLoading(this.elementRef.nativeElement);
            this.memberCreditService.prepareTopUpPaymentData(new PaymentDataInput({
                quantity: this.quantity,
                paymentGateway: 'Stripe',
                successUrl: `${AppConsts.remoteServiceBaseUrl}/receipt/${this.appSession.tenantId || 0}/{initialInvoiceXref}?usePortal=1`,
                cancelUrl: location.href
            })).pipe(
                finalize(() => this.loadingService.finishLoading(this.elementRef.nativeElement))
            ).subscribe((res) => {
                location.href = res.paymentData;
                /*
                if (!window.open(res.paymentData, '_blank')) {
                    this.paymentLink = res.paymentData;
                    this.changeDetectorRef.detectChanges();
                    this.notifyService.info(this.ls.l('TurnOffPopupBlockerMessage'));
                }
                else
                    this.closeDialog();
                */
            });
        }
    }

    closeDialog() {
        this.dialog.close();
    }
}