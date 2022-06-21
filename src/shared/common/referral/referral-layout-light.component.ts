/** Core imports */
import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Application imports */
import { LifecycleSubjectsService } from '@shared/common/lifecycle-subjects/lifecycle-subjects.service';
import { ReferralLayoutBaseComponent } from './referral-layout-base.component';

@Component({
    selector: 'referral-layout-light',
    templateUrl: 'referral-layout-light.component.html',
    styleUrls: ['referral-layout-light.component.less'],
    providers: [LifecycleSubjectsService],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReferralLayoutLightComponent extends ReferralLayoutBaseComponent {}