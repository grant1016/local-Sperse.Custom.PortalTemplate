/** Core imports */
import { Injectable } from '@angular/core';

/** Third party imports */
import { Observable } from 'rxjs';
import { map, publishReplay, refCount } from 'rxjs/operators';

/** Application imports */
import {
    PaymentMethodInfo,
    GetPaymentsDto,
    UserPaymentServiceProxy
} from 'shared/service-proxies/service-proxies';
import { PaymentsInfoService } from '../../payments-info/payments-info.service';

@Injectable()
export class PaymentWizardPaymentsInfoService extends PaymentsInfoService {
    constructor(
        private paymentService: UserPaymentServiceProxy
    ) {
        super();
    }

    getPaymentsObserverable(): Observable<GetPaymentsDto> {
        return this.paymentService.getPayments().pipe(
            publishReplay(),
            refCount()
        );
    }

    getPaymentMethodsObserverable(): Observable<PaymentMethodInfo[]> {
        return this.paymentService.getPaymentMethods().pipe(
            publishReplay(),
            refCount()
        );
    }
}