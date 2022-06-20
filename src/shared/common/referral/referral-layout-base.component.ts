import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppLocalizationService } from '@app/shared/common/localization/app-localization.service';

@Component({
    selector: 'referral-layout-base',
    templateUrl: 'referral-layout-base.component.html',
    styleUrls: [
        '../../../shared/common/dx-data-grid/dx-data-grid.directive.less',
        'referral-layout-base.component.less'
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReferralLayoutBaseComponent {
    showReferralInfo = true;
    constructor(
        public ls: AppLocalizationService
    ) {}
}