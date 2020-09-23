import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
    selector: 'link-tracking',
    templateUrl: 'link-tracking.component.html',
    styleUrls: [ 'link-tracking.component.less' ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LinkTrackingComponent {
    constructor() {
    }
}