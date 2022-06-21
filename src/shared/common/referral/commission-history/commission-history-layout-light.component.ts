/** Core imports */
import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Application imports */
import { CommissionHistoryLayoutBaseComponent } from './commission-history-layout-base.component';

@Component({
    selector: 'commission-history-layout-light',
    templateUrl: 'commission-history-layout-base.component.html',
    styleUrls: ['commission-history-layout-light.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CommissionHistoryLayoutLightComponent extends CommissionHistoryLayoutBaseComponent {
    onGridClick(event) {
        if (event.target.classList.contains('dx-datagrid-nodata'))
            this.router.navigate([], {queryParams: {tab: 2}});
    }
}