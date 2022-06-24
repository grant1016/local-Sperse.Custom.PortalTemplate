import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { publishReplay, refCount, switchMap } from 'rxjs/operators';
import {
    GetLedgerTotalsOutput,
    LinkTrackingOutput, LinkTrackingServiceProxy,
    UserCommissionServiceProxy
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
        private userCommission: UserCommissionServiceProxy,
        private linkTrackingServiceProxy: LinkTrackingServiceProxy
    ) {}

    refresh() {
        this._refresh.next(null);
    }

    getLinks(): Observable<LinkTrackingOutput[]> {
        return this.linkTrackingServiceProxy.getAll();
    }

    addLink(link: string): void {
        this.linkTrackingServiceProxy.addLink(link).subscribe(() => {
            abp.notify.success('Link was successfully added');
        });
    }

    deleteLink(id: number): Observable<void> {
        return this.linkTrackingServiceProxy.delete(id);
    }
}