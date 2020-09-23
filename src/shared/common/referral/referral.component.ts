import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppLocalizationService } from '@app/shared/common/localization/app-localization.service';

@Component({
    selector: 'referral',
    templateUrl: 'referral.component.html',
    styleUrls: [ 'referral.component.less' ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReferralComponent {
    constructor(public ls: AppLocalizationService) {}
}