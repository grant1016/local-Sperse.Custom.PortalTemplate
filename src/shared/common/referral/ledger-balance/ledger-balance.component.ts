import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
    selector: 'ledger-balance',
    templateUrl: 'ledger-balance.component.html',
    styleUrls: [ 'ledger-balance.component.less' ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LedgerBalanceComponent {
    constructor() {
    }
}