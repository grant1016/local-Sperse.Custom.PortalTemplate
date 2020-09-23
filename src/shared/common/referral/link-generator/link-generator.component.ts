import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
    selector: 'link-generator',
    templateUrl: 'link-generator.component.html',
    styleUrls: [ 'link-generator.component.less' ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LinkGeneratorComponent {
    constructor() {
    }
}