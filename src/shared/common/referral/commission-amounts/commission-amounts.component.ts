import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppLocalizationService } from '@app/shared/common/localization/app-localization.service';

@Component({
    selector: 'commission-amounts',
    templateUrl: 'commission-amounts.component.html',
    styleUrls: [ 'commission-amounts.component.less' ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CommissionAmountsComponent {
    constructor(
        public ls: AppLocalizationService
    ) {}
}