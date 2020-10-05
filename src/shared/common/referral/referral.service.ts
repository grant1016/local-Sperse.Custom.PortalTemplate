import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { publishReplay, refCount } from 'rxjs/operators';
import { GetLedgerTotalsOutput, UserCommissionServiceProxy } from '@shared/service-proxies/service-proxies';

@Injectable()
export class ReferralService {
    ledgerTotals$: Observable<GetLedgerTotalsOutput> = this.userCommission.getTotals().pipe(
        publishReplay(),
        refCount()
    )
    constructor(private userCommission: UserCommissionServiceProxy) {}
}