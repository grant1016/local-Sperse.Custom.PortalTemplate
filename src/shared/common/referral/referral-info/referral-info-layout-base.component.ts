/** Core imports */
import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Third party imports  */
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

/** Application imports  */
import { AppLocalizationService } from '@app/shared/common/localization/app-localization.service';
import { AppConsts } from '@shared/AppConsts';
import { ContactServiceProxy, GetSourceContactInfoOutput } from '@shared/service-proxies/service-proxies';
import { ProfileService } from '@shared/common/profile-service/profile.service';
import { AppService } from '@app/app.service';
import { AppSessionService } from '@shared/common/session/app-session.service';
import { ClipboardService } from '@node_modules/ngx-clipboard';
import { NotifyService } from 'abp-ng2-module';

@Component({
    selector: 'referral-info-layout-base',
    templateUrl: 'referral-info-layout-base.component.html',
    styleUrls: [ 'referral-info-layout-base.component.less' ],
    providers: [ContactServiceProxy],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReferralInfoLayoutBaseComponent {
    affiliateCode$: Observable<string> = this.profileService.accessCode$;
    affiliateValidationRules = [
        {
            type: 'pattern',
            pattern: AppConsts.regexPatterns.affiliateCode,
            message: this.ls.l('AffiliateCodeIsNotValid')
        },
        {
            type: 'stringLength',
            max: AppConsts.maxAffiliateCodeLength,
            message: this.ls.l('MaxLengthIs', AppConsts.maxAffiliateCodeLength)
        }
    ];
    sourceContactInfo$: Observable<GetSourceContactInfoOutput> = this.contactProxy.isAccessible(this.appSession.user.contactId).pipe(
        switchMap((isAccessible: boolean) => {
            return isAccessible ? this.contactProxy.getSourceContactInfo(this.appSession.user.contactId) : of(null);
        })
    );
    profilePictureUrl$: Observable<string> = this.profileService.profilePictureUrl$;

    constructor(
        private contactProxy: ContactServiceProxy,
        private profileService: ProfileService,
        private clipboardService: ClipboardService,
        private notifyService: NotifyService,
        public ls: AppLocalizationService,
        public appService: AppService,
        public appSession: AppSessionService
    ) {}

    updateAffiliateCode(value): void {
        this.profileService.updateAccessCode(value);
    }

    getThumbnailSrc(thumbnailId?: string): string {
        return this.profileService.getContactPhotoUrl(thumbnailId, true);
    }

    saveToClipboard(event, value) {
        this.clipboardService.copyFromContent(value);
        this.notifyService.info(this.ls.l('SavedToClipboard'));
        event.stopPropagation();
    }
}