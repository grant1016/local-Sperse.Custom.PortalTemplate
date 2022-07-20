/** Core imports */
import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Application imports */
import { ReferralInfoLayoutBaseComponent } from './referral-info-layout-base.component';
import { ContactServiceProxy } from '@shared/service-proxies/service-proxies';

@Component({
    selector: 'referral-info-layout-light',
    templateUrl: 'referral-info-layout-light.component.html',
    styleUrls: ['referral-info-layout-light.component.less'],
    providers: [ContactServiceProxy],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReferralInfoLayoutLightComponent extends ReferralInfoLayoutBaseComponent {}