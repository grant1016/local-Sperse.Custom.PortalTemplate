import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
    selector: 'commission-amount-item',
    templateUrl: 'commission-amount-item.component.html',
    styleUrls: [ 'commission-amount-item.component.less' ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CommissionAmountItemComponent {
    @Input() label: string;
    @Input() value: number;
    @Input() valueColor: string;
    constructor() {}
}