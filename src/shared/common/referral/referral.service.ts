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
    SetAffiliateLinkImageInput
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

    constructor(
        private ls: AppLocalizationService,
        private userCommission: UserCommissionServiceProxy,
        private affiliateLinkProxy: AffiliateLinkServiceProxy
    ) {}

    refresh() {
        this._refresh.next(null);
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