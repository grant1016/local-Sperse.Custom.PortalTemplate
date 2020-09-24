import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ClipboardService } from '@node_modules/ngx-clipboard';
import { NotifyService } from '@abp/notify/notify.service';
import { AppLocalizationService } from '@app/shared/common/localization/app-localization.service';

@Component({
    selector: 'link-generator',
    templateUrl: 'link-generator.component.html',
    styleUrls: [ 'link-generator.component.less' ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LinkGeneratorComponent {
    initialLinks = [];
    displayedLinks = this.initialLinks;
    constructor(
        private clipboardService: ClipboardService,
        private notifyService: NotifyService,
        private ls: AppLocalizationService
    ) {}

    copy(link: string) {
        this.clipboardService.copyFromContent(link);
        this.notifyService.info(this.ls.l('SavedToClipboard'));
    }

    search(e) {
        this.displayedLinks = this.initialLinks.filter((link: string) => {
            return link.indexOf(e.value) >= 0;
        });
    }
}