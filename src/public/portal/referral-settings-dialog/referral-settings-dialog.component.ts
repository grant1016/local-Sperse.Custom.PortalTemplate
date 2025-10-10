/** Core imports */
import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';

/** Third party imports */
import { ClipboardService } from 'ngx-clipboard';
import { of } from 'rxjs';
import { map, first, takeUntil, finalize } from 'rxjs/operators';

/** Application imports */
import { AppLocalizationService } from '@app/shared/common/localization/app-localization.service';
import { ReferralService } from '@shared/common/referral/referral.service';
import { ProfileService } from '@shared/common/profile-service/profile.service';
import { SharingService } from '@shared/common/sharing-service/sharing.service';
import { NotifyService } from 'abp-ng2-module';
import { LifecycleSubjectsService } from '@shared/common/lifecycle-subjects/lifecycle-subjects.service';
import { AppSessionService } from '@shared/common/session/app-session.service';
import { AffiliateLinkInfo, MemberSettingsServiceProxy, UpdateUserAffiliateCodeDto, UserCommissionServiceProxy } from '@shared/service-proxies/service-proxies';
import { ShareSocialDialogComponent } from '../share-social-dialog/share-social-dialog.component';

@Component({
    selector: 'referral-settings-dialog',
    templateUrl: 'referral-settings-dialog.component.html',
    styleUrls: ['referral-settings-dialog.component.less']
})
export class ReferralSettingsDialogComponent implements OnInit, OnDestroy {
    referralCode: string = '';
    originalReferralCode: string = '';
    referralLink: string = '';
    selectedLink: string = '';
    suggestedCopy: string = '';
    isDarkMode: boolean = false;
    discordUserId: string = '';
    baseUrl: string = '';
    isSaving: boolean = false;
    affiliateLinks: AffiliateLinkInfo[] = [];
    selectedAffiliateLinkId: number | null = null;
    
    // Commission rates
    tier1CommissionRate: number | null = null;
    tier2CommissionRate: number | null = null;
    showCommissionSection: boolean = false;
    
    links$ = this.referralService.getLinks().pipe(map(links => {
        console.log('Affiliate links fetched:', links);
        this.affiliateLinks = links || [];
        
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
        private lifeCycleSubject: LifecycleSubjectsService,
        private dialog: MatDialog,
        private memberSettingsService: MemberSettingsServiceProxy,
        private userCommissionService: UserCommissionServiceProxy,
        private appSessionService: AppSessionService
    ) {
        console.log('Dialog data received:', data);
        console.log('isDarkMode:', data?.isDarkMode);
        console.log('discordUserId:', data?.discordUserId);
        
        if (data && data.isDarkMode !== undefined) {
            this.isDarkMode = data.isDarkMode;
        }
        if (data && data.discordUserId) {
            this.discordUserId = data.discordUserId;
        }
        if (data && data.affiliateCode) {
            this.referralCode = data.affiliateCode;
            
        }
    }

    ngOnInit(): void {
        // Initialize with the last available link
        this.links$.pipe(first()).subscribe(links => {
            console.log('Available links:', links);
            
            if (links && links.length > 0) {
                const lastLink = links[links.length - 1];
                this.selectedAffiliateLinkId = lastLink.id;
                this.baseUrl = lastLink.url;
                console.log('Base URL set to:', this.baseUrl);
                this.onSelectedLinkChanged({ value: lastLink });
            }
        });
        
        // Fetch commission rates
        this.loadCommissionRates();
    }

    loadCommissionRates(): void {
        this.userCommissionService.getRatesInfo()
            .pipe(first())
            .subscribe(
                (response) => {
                    console.log('Commission rates response:', response);
                    
                    // Extract rates from response - using the pattern: affiliateRate ?? defaultAffiliateRate
                    this.tier1CommissionRate = response.affiliateRate ?? response.defaultAffiliateRate;
                    this.tier2CommissionRate = response.affiliateRateTier2 ?? response.defaultAffiliateRateTier2;
                    
                    // Show section only if at least one rate exists
                    this.showCommissionSection = this.tier1CommissionRate !== null && this.tier1CommissionRate !== undefined
                        || this.tier2CommissionRate !== null && this.tier2CommissionRate !== undefined;
                },
                (error) => {
                    console.error('Error loading commission rates:', error);
                    this.showCommissionSection = false;
                }
            );
    }

    onAffiliateLinkChange(): void {
        const selectedLink = this.affiliateLinks.find(link => link.id === this.selectedAffiliateLinkId);
        if (selectedLink) {
            this.onSelectedLinkChanged({ value: selectedLink });
        }
    }

    onClose(): void {
        this.dialogRef.close();
    }

    onSelectedLinkChanged(event) {
        this.profileService.accessCode$.pipe(first()).subscribe(accessCode => {
            console.log(accessCode);
            
            this.suggestedCopy = event.value.suggestedCopy;
            this.baseUrl = event.value.url;
            this.referralCode = accessCode || '';
            this.originalReferralCode = accessCode || '';
            console.log('Initial referral code from profile:', this.referralCode);
            this.updateReferralLink();
        });
    }

    get isCodeChanged(): boolean {
        return this.referralCode.trim() !== this.originalReferralCode.trim();
    }

    onReferralCodeInput(event: any) {
        this.referralCode = event.target.value;
        this.updateReferralLink();
    }

    updateReferralLink() {
        if (!this.baseUrl) {
            console.warn('Base URL not set yet');
            return;
        }
        
        // Always rebuild from base URL + referral code
        this.referralLink = this.baseUrl + (this.referralCode ? '?ref=' + this.referralCode : '');
        this.selectedLink = this.referralLink;
        console.log('Updated referral link to:', this.referralLink);
    }

    copyReferralLink(): void {
        this.clipboardService.copyFromContent(this.selectedLink || this.referralLink);
        this.notifyService.info(this.ls.l('SavedToClipboard'));
    }

    shareOnSocial(): void {
        // Open the social sharing dialog
        this.dialog.open(ShareSocialDialogComponent, {
            width: '700px',
            maxWidth: '90vw',
            panelClass: 'custom-dialog-container',
            data: {
                shareLink: this.selectedLink || this.referralLink,
                referralCode: this.referralCode,
                suggestedCopy: this.suggestedCopy,
                isDarkMode: this.isDarkMode
            }
        });
    }

    useDiscordId(): void {
        if (this.discordUserId) {
            this.referralCode = this.discordUserId;
            this.updateReferralLink();
            this.notifyService.success('Discord ID set as referral code');
        } else {
            this.notifyService.warn('Discord ID not available. Please connect your Discord account first.');
        }
    }

    saveAffiliateCode(): void {
        if (!this.referralCode || !this.referralCode.trim()) {
            this.notifyService.error('Please enter a referral code');
            return;
        }

        // Validate referral code format (letters and numbers only)
        const validCodePattern = /^[a-zA-Z0-9]+$/;
        if (!validCodePattern.test(this.referralCode.trim())) {
            this.notifyService.error('Referral code must contain only letters and numbers');
            return;
        }

        this.isSaving = true;
        
        const input = new UpdateUserAffiliateCodeDto();
        input.affiliateCode = this.referralCode.trim();

        this.memberSettingsService.updateAffiliateCode(input)
            .pipe(finalize(() => {
                this.isSaving = false;
            }))
            .subscribe(
                () => {
                    this.notifyService.success('Affiliate code updated successfully');
                    // Update the original code to the new saved value
                    this.originalReferralCode = this.referralCode.trim();
                    // Update the session service user object with the new affiliate code
                    this.appSessionService.user.affiliateCode = this.referralCode.trim();
                    // Update the profile service access code BehaviorSubject directly
                    (this.profileService as any).accessCode.next(this.referralCode.trim());
                    // Update the parent component's data with the new affiliate code
                    if (this.data && this.data.affiliateCode !== undefined) {
                        this.data.affiliateCode = this.referralCode.trim();
                    }
                    // Update the profile service with new code
                    this.profileService.refreshMemberInfo({ data: 'update' });
                },
                (error) => {
                    console.error('Error updating affiliate code:', error);
                    if (error.error && error.error.error && error.error.error.message) {
                        this.notifyService.error(error.error.error.message);
                    } else {
                        this.notifyService.error('Failed to update affiliate code. Please try again.');
                    }
                }
            );
    }

    ngOnDestroy() {
        this.lifeCycleSubject.deactivate.next();
    }
}
