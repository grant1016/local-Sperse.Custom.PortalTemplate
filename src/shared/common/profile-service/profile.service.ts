/** Core imports */
import { Injectable } from '@angular/core';

/** Third party imports */
import { BehaviorSubject, Observable, Subject } from 'rxjs';

/** Application imports */
import { AppConsts } from '@shared/AppConsts';
import {
    LayoutType, MemberSettingsServiceProxy,
    MemberSubscriptionServiceProxy, UpdateUserAffiliateCodeDto
} from '@shared/service-proxies/service-proxies';
import { AppSessionService } from '@shared/common/session/app-session.service';
import { AppLocalizationService } from '@app/shared/common/localization/app-localization.service';

@Injectable()
export class ProfileService {
    private loadMemberInfo: Subject<null> = new Subject<null>();
    private accessCode: BehaviorSubject<string> = new BehaviorSubject<string>(this.appSession.user ? this.appSession.user.affiliateCode : null);
    accessCode$: Observable<string> = this.accessCode.asObservable();
    defaultPhotos = {
        [LayoutType.Default]: AppConsts.imageUrls.noPhoto
    };
    defaultProfilePictures = {
        [LayoutType.Default]: AppConsts.imageUrls.profileDefault,
    };
    defaultContactPhotos = {
        [LayoutType.Default]: {
            'small': AppConsts.imageUrls.noPhoto,
            'large': AppConsts.imageUrls.noPhoto
        }
    };
    private profilePictureUrl: BehaviorSubject<string> = new BehaviorSubject<string>(
        this.getProfilePictureUrl(this.appSession.user && this.appSession.user.profilePictureId)
    );
    profilePictureUrl$: Observable<string> = this.profilePictureUrl.asObservable();

    constructor(
        private appSession: AppSessionService,
        private subscriptionProxy: MemberSubscriptionServiceProxy,
        private memberSettingsService: MemberSettingsServiceProxy,
        private ls: AppLocalizationService
    ) {
        const eventMethod = window.addEventListener ? 'addEventListener' : 'attachEvent';
        const messageEvent = window[eventMethod] === 'attachEvent' ? 'onmessage' : 'message';
        window.addEventListener(messageEvent, this.refreshMemberInfo.bind(this), false);
    }

    refreshMemberInfo(e) {
        if (e.data === 'update') {
            this.loadMemberInfo.next();
        }
    }

    getPhoto(photo, gender = null): string {
        if (photo)
            return 'data:image/jpeg;base64,' + photo;
        if (gender)
            return 'assets/common/images/no-photo-' + gender + '.png';

        const tenant = this.appSession.tenant;
        return tenant && this.defaultPhotos[tenant.customLayoutType]
            ? this.defaultPhotos[tenant.customLayoutType]
            : AppConsts.imageUrls.noPhoto;
    }

    getProfilePictureUrl(id, defaultUrl = AppConsts.imageUrls.profileDefault) {
        if (!id) {
            let tenant = this.appSession.tenant;
            return tenant && this.defaultProfilePictures[tenant.customLayoutType]
                ? this.defaultProfilePictures[tenant.customLayoutType]
                : defaultUrl;
        }

        let tenantId = this.appSession.tenantId;
        return AppConsts.remoteServiceBaseUrl + '/api/Profile/Picture/' + (tenantId || 0) + '/' + id;
    }

    getContactPhotoUrl(publicId = null, isThumbnail = true, defaultPhotoSize: 'small' | 'large' = 'small'): string {
        if (publicId) {
            let actionName = isThumbnail ? 'thumbnail' : 'photo';
            let tenantId = this.appSession.tenantId || 0;
            return AppConsts.remoteServiceBaseUrl + '/api/contactPhoto/' + actionName + '/' + tenantId + '/' + publicId;
        }

        const tenant = this.appSession.tenant;
        return tenant && this.defaultContactPhotos[tenant.customLayoutType]
            ? this.defaultContactPhotos[tenant.customLayoutType][defaultPhotoSize]
            : AppConsts.imageUrls.noPhoto;
    }

    updateAccessCode(newAccessCode: string) {
        this.accessCode.next(newAccessCode);
        this.memberSettingsService.updateAffiliateCode(new UpdateUserAffiliateCodeDto({ affiliateCode: newAccessCode })).subscribe(
            () => {
                abp.notify.info(this.ls.l('AccessCodeUpdated'));
                this.appSession.user.affiliateCode = newAccessCode;
            },
            /** Update back if error comes */
            () => this.accessCode.next(this.appSession.user.affiliateCode)
        );
    }

    updatePictureUrl(pictureUrl: string) {
        this.profilePictureUrl.next(pictureUrl);
    }
}