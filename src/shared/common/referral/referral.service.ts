import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { publishReplay, refCount } from 'rxjs/operators';
import { GetCommissionTotalsOutput, UserCommissionServiceProxy } from '@shared/service-proxies/service-proxies';

@Injectable()
export class ReferralService {
    commissionTotals$: Observable<GetCommissionTotalsOutput> = this.userCommission.getCommissionTotals().pipe(
        publishReplay(),
        refCount()
    )
    constructor(private userCommission: UserCommissionServiceProxy) {}
}