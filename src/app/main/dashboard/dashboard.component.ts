/** Core imports */
import { Component } from '@angular/core';

/** Third party imports */

/** Application imports */
import { AppLocalizationService } from '@app/shared/common/localization/app-localization.service';

@Component({
    selector: 'dashboard',
    templateUrl: 'dashboard.component.html',
    styleUrls: ['dashboard.component.less']
})
export class DashboardComponent {
    constructor(
        public ls: AppLocalizationService
    ) {}
}
