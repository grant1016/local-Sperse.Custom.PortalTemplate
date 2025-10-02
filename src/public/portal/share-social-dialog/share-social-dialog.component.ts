/** Core imports */
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

/** Third party imports */
import { ClipboardService } from 'ngx-clipboard';

/** Application imports */
import { AppLocalizationService } from '@app/shared/common/localization/app-localization.service';
import { NotifyService } from 'abp-ng2-module';

@Component({
    selector: 'share-social-dialog',
    templateUrl: 'share-social-dialog.component.html',
    styleUrls: ['share-social-dialog.component.less']
})
export class ShareSocialDialogComponent implements OnInit {
    shareLink: string = '';
    referralCode: string = '';
    messageText: string = '';
    isDarkMode: boolean = false;

    constructor(
        public dialogRef: MatDialogRef<ShareSocialDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        public ls: AppLocalizationService,
        private clipboardService: ClipboardService,
        private notifyService: NotifyService
    ) {
        if (data) {
            this.shareLink = data.shareLink || '';
            this.referralCode = data.referralCode || '';
            this.isDarkMode = data.isDarkMode || false;
            
            // Set default message
            this.messageText = `Join me on this amazing platform! Use my referral code: ${this.referralCode}\n\n${this.shareLink}`;
        }
    }

    ngOnInit(): void {
    }

    onClose(): void {
        this.dialogRef.close();
    }

    copyLink(): void {
        this.clipboardService.copyFromContent(this.shareLink);
        this.notifyService.success('Link copied to clipboard!');
    }

    shareOnPlatform(platform: string): void {
        const encodedMessage = encodeURIComponent(this.messageText);
        const encodedLink = encodeURIComponent(this.shareLink);
        let url = '';

        switch (platform) {
            case 'facebook':
                url = `https://www.facebook.com/sharer/sharer.php?u=${encodedLink}`;
                break;
            case 'twitter':
                url = `https://twitter.com/intent/tweet?text=${encodedMessage}`;
                break;
            case 'whatsapp':
                url = `https://wa.me/?text=${encodedMessage}`;
                break;
            case 'linkedin':
                url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedLink}`;
                break;
            case 'telegram':
                url = `https://t.me/share/url?url=${encodedLink}&text=${encodedMessage}`;
                break;
            case 'reddit':
                url = `https://reddit.com/submit?url=${encodedLink}&title=${encodedMessage}`;
                break;
            case 'email':
                url = `mailto:?subject=Check out this amazing platform&body=${encodedMessage}`;
                break;
        }

        if (url) {
            window.open(url, '_blank', 'width=600,height=400');
        }
    }
}

