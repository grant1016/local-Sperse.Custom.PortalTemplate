/** Core imports */
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

/** Third party imports */
import { ClipboardService } from 'ngx-clipboard';

/** Application imports */
import { AppLocalizationService } from '@app/shared/common/localization/app-localization.service';

@Component({
    selector: 'referral-settings-dialog',
    templateUrl: 'referral-settings-dialog.component.html',
    styleUrls: ['referral-settings-dialog.component.less']
})
export class ReferralSettingsDialogComponent implements OnInit {
    referralCode: string = 'JOHNDOE25';
    referralLink: string = 'https://buy.domain.com/r/JOHNDOE25';
    isDarkMode: boolean = false;

    constructor(
        public dialogRef: MatDialogRef<ReferralSettingsDialogComponent>,
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

    copyReferralLink(): void {
        this.clipboardService.copyFromContent(this.referralLink);
        abp.notify.info('Referral link copied to clipboard!');
    }

    shareOnSocial(): void {
        // For now, just copy the link. Can be enhanced with actual social sharing
        this.clipboardService.copyFromContent(this.referralLink);
        abp.notify.info('Referral link copied to clipboard!');
    }

    useDiscordId(): void {
        // This would typically get the Discord ID from the user's connected Discord account
        // For now, we'll use a placeholder
        this.referralCode = 'DISCORD123';
        this.referralLink = 'https://buy.domain.com/r/DISCORD123';
    }
}
