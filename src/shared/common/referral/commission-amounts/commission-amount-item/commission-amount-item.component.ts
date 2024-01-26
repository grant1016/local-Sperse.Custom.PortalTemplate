import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { SettingsHelper } from '@app/shared/helpers/settings.helper';

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

    currency = SettingsHelper.getCurrency();
    constructor() {}
}