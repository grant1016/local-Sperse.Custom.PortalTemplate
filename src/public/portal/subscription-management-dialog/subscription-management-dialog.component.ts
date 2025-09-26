/** Core imports */
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

/** Third party imports */
import { ClipboardService } from 'ngx-clipboard';

/** Application imports */
import { AppLocalizationService } from '@app/shared/common/localization/app-localization.service';

export type CancellationStep = 'main' | 'cancel-options' | 'retention-offer' | 'confirmed';
export type CancellationType = 'immediate' | 'end-of-period';

@Component({
    selector: 'subscription-management-dialog',
    templateUrl: 'subscription-management-dialog.component.html',
    styleUrls: ['subscription-management-dialog.component.less']
})
export class SubscriptionManagementDialogComponent implements OnInit {
    step: CancellationStep = 'main';
    cancellationType: CancellationType = 'end-of-period';
    isDarkMode: boolean = false;

    // Mock data - in real implementation, this would come from a service
    subscriptionData = {
        planName: 'Premium Trading Membership',
        nextBilling: 'Oct 19, 2025',
        amount: '$59/month',
        status: 'Active'
    };

    constructor(
        public dialogRef: MatDialogRef<SubscriptionManagementDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        public ls: AppLocalizationService,
        private clipboardService: ClipboardService
    ) {
        if (data && data.isDarkMode !== undefined) {
            this.isDarkMode = data.isDarkMode;
        }
    }

    ngOnInit(): void {
        // Initialize component
    }

    onClose(): void {
        this.dialogRef.close();
    }

    handleCancel(): void {
        this.step = 'retention-offer';
    }

    handleCancelConfirm(): void {
        this.step = 'confirmed';
        // Here you would proceed with the actual cancellation
    }

    handleAcceptOffer(): void {
        this.step = 'confirmed';
        // Here you would handle the 50% off offer acceptance
    }

    handleDeclineOffer(): void {
        this.step = 'cancel-options';
    }

    resetDialog(): void {
        this.step = 'main';
        this.cancellationType = 'end-of-period';
    }

    updatePaymentMethod(): void {
        // TODO: Implement payment method update
        abp.notify.info('Payment method update functionality coming soon');
    }

    changePlan(): void {
        // TODO: Implement plan change
        abp.notify.info('Plan change functionality coming soon');
    }
}
