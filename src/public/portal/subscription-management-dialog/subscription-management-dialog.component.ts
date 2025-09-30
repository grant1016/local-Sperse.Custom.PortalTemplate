/** Core imports */
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

/** Third party imports */
import { ClipboardService } from 'ngx-clipboard';
import { finalize } from 'rxjs/operators';

/** Application imports */
import { AppLocalizationService } from '@app/shared/common/localization/app-localization.service';
import { UserSubscriptionServiceProxy, OrderSubscriptionDto, CancelOrderSubscriptionInput } from '@shared/service-proxies/service-proxies';

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
    cancelReason: string = '';
    isCancelling: boolean = false;

    // Subscription data
    subscriptionHistory: OrderSubscriptionDto[] = [];
    currentSubscription: OrderSubscriptionDto | null = null;
    subscriptionLoading: boolean = false;

    // Fallback data when subscription data is not available
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
        private clipboardService: ClipboardService,
        private userSubscriptionService: UserSubscriptionServiceProxy
    ) {
        if (data && data.isDarkMode !== undefined) {
            this.isDarkMode = data.isDarkMode;
        }
        if (data && data.currentSubscription) {
            this.currentSubscription = data.currentSubscription;
        }
    }

    ngOnInit(): void {
        // Load subscription history only if not already provided
        if (!this.currentSubscription) {
            this.getSubscriptionHistory();
        }
    }

    getSubscriptionHistory() {
        this.subscriptionLoading = true;
        this.userSubscriptionService.getSubscriptionHistory()
            .pipe(finalize(() => {
                this.subscriptionLoading = false;
            }))
            .subscribe(
                (subscriptions: OrderSubscriptionDto[]) => {
                    console.log('Dialog - Subscription History Data:', subscriptions);
                    this.subscriptionHistory = subscriptions;
                    // Get the current/active subscription (status "A" for Active/Current)
                    this.currentSubscription = subscriptions.find(sub => sub.statusCode === 'A') || subscriptions[0] || null;
                    console.log('Dialog - Current Subscription:', this.currentSubscription);
                },
                (error) => {
                    console.error('Error fetching subscription history in dialog:', error);
                    abp.notify.error('Failed to load subscription information');
                }
            );
    }

    // Helper method to format currency and amount
    formatCurrency(amount: number, currency: string): string {
        if (!amount || !currency) return '';
        return `${currency==="USD"?"$":currency==="EUR"?"€":currency}${amount}`;
    }

    // Helper method to format payment period
    formatPaymentPeriod(period: string): string {
        if (!period) return 'month';
        if(period.toLowerCase()==="monthly"){
            return "month"
        }else if(period.toLowerCase()==="yearly"){
            return "year"
        }
        return period.toLowerCase();
    }

    // Helper method to get subscription status color
    getSubscriptionStatusColor(statusCode: string): string {
        switch (statusCode) {
            case 'A': return 'bg-[#16a24933] text-[#16a249] border-[#16a24933]'; // Active/Current
            case 'C': return 'bg-[#ef444433] text-[#ef4444] border-[#ef444433]'; // Cancelled
            case 'E': return 'bg-[#f59e0b33] text-[#f59e0b] border-[#f59e0b33]'; // Expired
            default: return 'bg-[#6b728033] text-[#6b7280] border-[#6b728033]'; // Unknown
        }
    }

    // Helper method to get plan name
    getPlanName(): string {
        return this.currentSubscription?.productName || this.subscriptionData.planName;
    }

    // Helper method to get next billing date
    getNextBillingDate(): string {
        if (this.currentSubscription?.endDate) {
            return new Date(this.currentSubscription.endDate).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
            });
        }
        return this.subscriptionData.nextBilling;
    }

    // Helper method to get amount
    getAmount(): string {
        if (this.currentSubscription?.fee && this.currentSubscription?.currencyId) {
            return `${this.formatCurrency(this.currentSubscription.fee, this.currentSubscription.currencyId)}/${this.formatPaymentPeriod(this.currentSubscription.paymentPeriodType)}`;
        }
        return this.subscriptionData.amount;
    }

    // Helper method to get status
    getStatus(): string {
        return this.currentSubscription?.status || this.subscriptionData.status;
    }

    // Helper method to get discounted price (50% off)
    getDiscountedPrice(): string {
        if (this.currentSubscription?.fee && this.currentSubscription?.currencyId) {
            const discountedAmount = this.currentSubscription.fee * 0.5;
            return `${this.formatCurrency(discountedAmount, this.currentSubscription.currencyId)}/${this.formatPaymentPeriod(this.currentSubscription.paymentPeriodType)}`;
        }
        return '$29.95/month';
    }

    onClose(): void {
        this.dialogRef.close();
    }

    handleCancel(): void {
        this.step = 'cancel-options';
    }

    onCancelReasonInput(event: any): void {
        const value = event.target.value;
        console.log('Cancel reason input:', value);
        this.cancelReason = value;
    }

    handleCancelConfirm(): void {
        if (!this.currentSubscription) {
            abp.notify.error('No subscription found to cancel');
            return;
        }
        
        console.log('Current cancelReason value:', this.cancelReason);
        console.log('CancelReason type:', typeof this.cancelReason);
        console.log('CancelReason length:', this.cancelReason ? this.cancelReason.length : 'null/undefined');
        
        if (!this.cancelReason || !this.cancelReason.trim()) {
            abp.notify.error('Please provide a cancellation reason');
            return;
        }

        this.isCancelling = true;
        
        const cancelInput = new CancelOrderSubscriptionInput();
        cancelInput.subscriptionId = this.currentSubscription.id;
        cancelInput.cancelAtPeriodEnd = this.cancellationType === 'end-of-period';
        cancelInput.cancelationReason = this.cancelReason.trim();

        this.userSubscriptionService.cancel(cancelInput)
            .pipe(finalize(() => {
                this.isCancelling = false;
            }))
            .subscribe(
                () => {
                    abp.notify.success('Subscription cancelled successfully');
                    this.step = 'confirmed';
                    // Update the subscription status
                    if (this.currentSubscription) {
                        this.currentSubscription.statusCode = 'C';
                        this.currentSubscription.status = 'Cancelled';
                    }
                },
                (error) => {
                    console.error('Error cancelling subscription:', error);
                    abp.notify.error('Failed to cancel subscription. Please try again.');
                }
            );
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
