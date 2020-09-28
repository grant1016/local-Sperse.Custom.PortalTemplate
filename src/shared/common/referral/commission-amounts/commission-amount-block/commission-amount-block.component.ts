import { ChangeDetectionStrategy, Component, Input, HostBinding } from '@angular/core';
import { AppLocalizationService } from '@app/shared/common/localization/app-localization.service';

@Component({
    selector: 'commission-amount-block',
    templateUrl: 'commission-amount-block.component.html',
    styleUrls: [ 'commission-amount-block.component.less' ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CommissionAmountBlockComponent {
    @Input() title: string;
    @HostBinding('style.backgroundColor') @Input() color: string;
    constructor(public ls: AppLocalizationService) {}
}