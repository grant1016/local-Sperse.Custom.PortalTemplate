/** Core imports */
import { Component, Inject } from '@angular/core';

/** Third party imports */
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

/** Application imports */
import { AppLocalizationService } from '@app/shared/common/localization/app-localization.service';
import { AppConsts } from '@shared/AppConsts';

@Component({
    selector: 'cancel-subscription-dialog',
    templateUrl: './cancel-subscription-dialog.component.html',
    styleUrls: ['./cancel-subscription-dialog.component.less']
})
export class CancelSubscriptionDialogComponent {
    formatting = AppConsts.formatting;
    showCancelAtPeriodEnd: boolean = false;

    cancelOptions: any[] = [
        { id: false, text: 'Immediately' },
        { id: true, text: 'End of the current period' },
    ];
    
    constructor(
        public dialogRef: MatDialogRef<CancelSubscriptionDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data,
        public ls: AppLocalizationService
    ) {
        this.showCancelAtPeriodEnd = !data.cancellationDate && (!data.gateway || data.gateway == 'Stripe');
    }

    onNoClick(): void {
        this.dialogRef.close();
    }
}
