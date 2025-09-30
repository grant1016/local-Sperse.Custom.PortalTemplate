/** Core imports */
import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

/** Third party imports */
import { ClipboardService } from 'ngx-clipboard';
import { of } from 'rxjs';
import { map, first, takeUntil } from 'rxjs/operators';

/** Application imports */
import { AppLocalizationService } from '@app/shared/common/localization/app-localization.service';
import { ReferralService } from '@shared/common/referral/referral.service';
import { ProfileService } from '@shared/common/profile-service/profile.service';
import { SharingService } from '@shared/common/sharing-service/sharing.service';
import { NotifyService } from 'abp-ng2-module';
import { LifecycleSubjectsService } from '@shared/common/lifecycle-subjects/lifecycle-subjects.service';
import { AffiliateLinkInfo } from '@shared/service-proxies/service-proxies';

@Component({
    selector: 'referral-settings-dialog',
    templateUrl: 'referral-settings-dialog.component.html',
    styleUrls: ['referral-settings-dialog.component.less']
})
export class ReferralSettingsDialogComponent implements OnInit, OnDestroy {
    referralCode: string = '';
    referralLink: string = '';
    selectedLink: string = '';
    suggestedCopy: string = '';
    isDarkMode: boolean = false;
    
    links$ = this.referralService.getLinks().pipe(map(links => {
        console.log(links);
        
        return links.map((link, index) => {
            link['index'] = index + 1;
            return link;
        });
    }));

    constructor(
        public dialogRef: MatDialogRef<ReferralSettingsDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        public ls: AppLocalizationService,
        private clipboardService: ClipboardService,
        public referralService: ReferralService,
        private profileService: ProfileService,
        private sharingService: SharingService,
        private notifyService: NotifyService,
        private lifeCycleSubject: LifecycleSubjectsService
    ) {
        if (data && data.isDarkMode !== undefined) {
            this.isDarkMode = data.isDarkMode;
        }
    }

    ngOnInit(): void {
        // Initialize with the last available link
        this.links$.pipe(first()).subscribe(links => {
            console.log(links);
            
            if (links && links.length > 0) {
                const lastLink = links[links.length - 1];
                this.onSelectedLinkChanged({ value: lastLink });
            }
        });
    }

    onClose(): void {
        this.dialogRef.close();
    }

    onSelectedLinkChanged(event) {
        this.profileService.accessCode$.pipe(first()).subscribe(accessCode => {
            this.suggestedCopy = event.value.suggestedCopy;
            this.selectedLink = event.value.url + (accessCode ? 
                (event.value.url.includes('?') ? '&' : '?') + 'ref=' + accessCode : ''
            );
            this.referralLink = this.selectedLink;
        });
    }

    copyReferralLink(): void {
        this.clipboardService.copyFromContent(this.selectedLink || this.referralLink);
        this.notifyService.info(this.ls.l('SavedToClipboard'));
    }

    shareOnSocial(): void {
        // For now, just copy the link. Can be enhanced with actual social sharing
        this.clipboardService.copyFromContent(this.selectedLink || this.referralLink);
        this.notifyService.info(this.ls.l('SavedToClipboard'));
    }

    useDiscordId(): void {
        // This would typically get the Discord ID from the user's connected Discord account
        // For now, we'll use a placeholder
        this.referralCode = 'DISCORD123';
        this.referralLink = 'https://buy.domain.com/r/DISCORD123';
    }

    ngOnDestroy() {
        this.lifeCycleSubject.deactivate.next();
    }
}
