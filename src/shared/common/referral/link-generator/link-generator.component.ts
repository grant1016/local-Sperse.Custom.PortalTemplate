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
    initialLinks = [
        'https://hoa.com/dirti-ducts/ref/stephanie',
        'https://hoa.com/orlando-auto-body/ref/stephanie',
        'https://hoa.com/autoworks-detailing-llc/ref/stephanie',
        'https://hoa.com/auto-glass-medix/ref/stephanie',
        'https://hoa.com/outdoor-homes-llc/ref/stephanie',
        'https://hoa.com/hoa-partners/major-law-group/ref/stephanie',
        'https://hoa.com/chapter-7-bankruptcy/ref/stephanie',
        'https://hoa.com/hoa-partners/assured-partners/ref/stephanie',
        'https://hoa.com/steamy-concepts/stephanie',
        'https://hoa.com/hoa-partners/my-credit-guy/ref/stephanie',
        'https://hoa.com/arizona-binsr-repair/ref/stephanie',
        'https://hoa.com/res-electrical-services/ref/stephanie',
        'https://hoa.com/estate-planning-probate-pr-lawteam/ref/stephanie',
        'https://hoa.com/national-first-response-fire-damage/ref/stephanie',
        'https://hoa.com/floor-me-az/ref/stephanie',
        'https://hoa.com/iconic-garage-door-services/ref/stephanie',
        'https://hoa.com/strategic-marketing-360/ref/stephanie',
    ];
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