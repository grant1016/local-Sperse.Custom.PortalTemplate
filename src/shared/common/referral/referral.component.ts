import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppLocalizationService } from '@app/shared/common/localization/app-localization.service';

@Component({
    selector: 'referral',
    templateUrl: 'referral.component.html',
    styleUrls: [
        '../../../shared/common/dx-data-grid/dx-data-grid.directive.less',
        'referral.component.less'
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReferralComponent {
    showReferralInfo = true;
    constructor(
        public ls: AppLocalizationService
    ) {}
}