/** Core imports */
import { Injectable } from '@angular/core';

/** Third party imports */
import { BehaviorSubject, Observable, Subject, forkJoin } from 'rxjs';
import { map, publishReplay, refCount, switchMap } from 'rxjs/operators';
import * as moment from 'moment-timezone';

/** Application imports */
import { AppConsts } from '@shared/AppConsts';
import {
    GetMemberInfoOutput,
    SubscriptionShortInfoOutput,
    LayoutType, MemberSettingsServiceProxy,
    MemberSubscriptionServiceProxy, UpdateUserAffiliateCodeDto,
    MemberCreditServiceProxy,
    PaymentServiceProxy,
    PaypalSettingsInfo,
    MemberCreditBalanceDto
} from '@shared/service-proxies/service-proxies';
import { AppSessionService } from '@shared/common/session/app-session.service';
import { AppLocalizationService } from '@app/shared/common/localization/app-localization.service';
import { ServiceType } from './service-type.enum';

@Injectable()
export class ProfileService {
    private readonly SYSTEM_TYPE = '';
    private accessCode: BehaviorSubject<string> = new BehaviorSubject<string>(
        this.appSession.user ? this.appSession.user.affiliateCode : null
    );
    accessCode$: Observable<string> = this.accessCode.asObservable();
    
    private loadMemberInfo: Subject<null> = new Subject<null>();
    memberInfo$: Observable<GetMemberInfoOutput> =
        this.loadMemberInfo.pipe(
            switchMap(() => this.subscriptionProxy.getMemberInfo(
                this.SYSTEM_TYPE,
                undefined,
                undefined
            )),
            publishReplay(),
            refCount()
        );

    memberCredits$: Observable<MemberCreditBalanceDto> = this.memberCreditService.getBalance().pipe(
        publishReplay(),
        refCount()
    );
    availablePaymentMethods$: Observable<{ isStripeEnabled: boolean, paypalInfo: PaypalSettingsInfo  }> = forkJoin(
        [this.paymentsService.isStripeEnabled(), this.paymentsService.isPaypalEnabled()]
    ).pipe(
        map(([isStripeEnabled, paypalInfo]) => {
            return {
                isStripeEnabled: isStripeEnabled,
                paypalInfo: paypalInfo
            }
        }),
        publishReplay(),
        refCount()
    );

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
        private memberCreditService: MemberCreditServiceProxy,
        private paymentsService: PaymentServiceProxy,
        private ls: AppLocalizationService
    ) {
        const eventMethod = window.addEventListener ? 'addEventListener' : 'attachEvent';
        const messageEvent = window[eventMethod] === 'attachEvent' ? 'onmessage' : 'message';
        window.addEventListener(messageEvent, this.refreshMemberInfo.bind(this), false);
        setTimeout(() => this.refreshMemberInfo({data: 'update'}), 2000);
    }

    refreshMemberInfo(e) {
        if (this.SYSTEM_TYPE && e.data === 'update') {
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

    checkServiceSubscription(serviceTypeId: ServiceType): Observable<boolean> {
        return this.memberInfo$.pipe(
            map((memberInfo: GetMemberInfoOutput) => {
                return memberInfo.subscriptions.some((sub: SubscriptionShortInfoOutput) => {
                    return this.isSubscriptionAvailable(sub, serviceTypeId);
                });
            })
        );
    }

    private isSubscriptionAvailable(subscription: SubscriptionShortInfoOutput, serviceTypeId: ServiceType): boolean {
        return subscription.serviceTypeId.toLowerCase() === serviceTypeId.toString().toLowerCase()
            && (!subscription.finalEndDate || subscription.finalEndDate.diff(moment()) > 0);
    }

    hasSubscriptions(serviceTypeIds: ServiceType[], operator: 'or' | 'and'): Observable<boolean> {
        return this.memberInfo$.pipe(
            map((memberInfo: GetMemberInfoOutput) => {
                return serviceTypeIds[operator === 'or' ? 'some' : 'every']((serviceTypeId: ServiceType) => {
                    return memberInfo.subscriptions.some((subscription: SubscriptionShortInfoOutput) => {
                        return this.isSubscriptionAvailable(subscription, serviceTypeId);
                    });
                });
            })
        );
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