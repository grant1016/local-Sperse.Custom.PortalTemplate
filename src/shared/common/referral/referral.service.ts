import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { publishReplay, refCount, switchMap } from 'rxjs/operators';
import { AppLocalizationService } from '@app/shared/common/localization/app-localization.service';
import {
    GetLedgerTotalsOutput,
    AffiliateLinkInfo,
    CreateAffiliateLinkInput,
    AffiliateLinkServiceProxy,
    UserCommissionServiceProxy,
    UpdateAffiliateLinkInput,
    SetAffiliateLinkImageInput,
    AffiliatePaymentSettingInfo,
    AffiliatePaymentServiceProxy
} from '@shared/service-proxies/service-proxies';

@Injectable()
export class ReferralService {
    private _refresh: BehaviorSubject<null> = new BehaviorSubject<null>(null);
    refresh$: Observable<null> = this._refresh.asObservable();
    ledgerTotals$: Observable<GetLedgerTotalsOutput> = this.refresh$.pipe(
        switchMap(() => this.userCommission.getTotals()),
        publishReplay(),
        refCount()
    );
    
    private _refreshPaymentSettings: BehaviorSubject<null> = new BehaviorSubject<null>(null);
    refreshPaymentSettings$: Observable<null> = this._refreshPaymentSettings.asObservable();        
    affiliatePaymentSettings$: Observable<AffiliatePaymentSettingInfo[]> = this.refreshPaymentSettings$.pipe(
        switchMap(() => this.paymentProxy.getAll()),
        publishReplay(),
        refCount()
    );

    constructor(
        private ls: AppLocalizationService,
        private paymentProxy: AffiliatePaymentServiceProxy,
        private userCommission: UserCommissionServiceProxy,
        private affiliateLinkProxy: AffiliateLinkServiceProxy
    ) {}

    refresh() {
        this._refresh.next(null);
    }

    refreshPaymentSettings() {
        this._refreshPaymentSettings.next(null);
    }

    getLinks(): Observable<AffiliateLinkInfo[]> {
        return this.affiliateLinkProxy.getAll();
    }

    addOrUpdateLink(linkInfo: AffiliateLinkInfo): Observable<any> {
        return linkInfo.id ?
            this.affiliateLinkProxy.update(
                new UpdateAffiliateLinkInput(linkInfo)
            ) : this.affiliateLinkProxy.create(
                new CreateAffiliateLinkInput(linkInfo)
            );
    }

    setAffiliateLinkImage(linkImage: SetAffiliateLinkImageInput): Observable<void> {
        return this.affiliateLinkProxy.setAffiliateLinkImage(linkImage);
    }

    deleteLink(id: number): Observable<void> {
        return this.affiliateLinkProxy.delete(id);
    }
}