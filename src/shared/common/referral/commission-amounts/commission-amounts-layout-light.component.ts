/** Core imports */
import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Application imports */
import { CommissionAmountsLayoutBaseComponent } from './commission-amounts-layout-base.component';

@Component({
    selector: 'commission-amounts-layout-light',
    templateUrl: 'commission-amounts-layout-light.component.html',
    styleUrls: ['commission-amounts-layout-light.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CommissionAmountsLayoutLightComponent extends CommissionAmountsLayoutBaseComponent {
    userEmailAddress = this.appSessionService.user.emailAddress;
}