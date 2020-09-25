/** Core imports */
import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Third party imports */
import { ClipboardService } from 'ngx-clipboard';
import { Observable, combineLatest, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

/** Application imports */
import { NotifyService } from '@abp/notify/notify.service';
import { AppLocalizationService } from '@app/shared/common/localization/app-localization.service';
import { ProfileService } from '@shared/common/profile-service/profile.service';
import { GeneratorLink } from '@shared/common/referral/link-generator/generator-link.interface';

@Component({
    selector: 'link-generator',
    templateUrl: 'link-generator.component.html',
    styleUrls: [ 'link-generator.component.less' ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LinkGeneratorComponent {
    accessCode$: Observable<string> = this.profileService.accessCode$;
    private _search: BehaviorSubject<string> = new BehaviorSubject<string>('');
    search$: Observable<string> = this._search.asObservable();
    initialLinks: any[] = [];
    initialLinks$: Observable<GeneratorLink[]> = this.accessCode$.pipe(
        map((accessCode: string) => this.initialLinks.map((link: GeneratorLink) => {
            link.link = link.link + '/' + accessCode;
            return link;
        }))
    );
    displayedLinks$: Observable<GeneratorLink[]> = combineLatest(
        this.initialLinks$,
        this.search$
    ).pipe(
        map(([initialLinks, search]: [GeneratorLink[], string]) => {
            return initialLinks.filter((link: GeneratorLink) => {
                return link.link.indexOf(search) >= 0;
            });
        })
    );
    constructor(
        private clipboardService: ClipboardService,
        private notifyService: NotifyService,
        private ls: AppLocalizationService,
        private profileService: ProfileService
    ) {}

    copy(link: string) {
        this.clipboardService.copyFromContent(link);
        this.notifyService.info(this.ls.l('SavedToClipboard'));
    }

    search(e) {
        this._search.next(e.value);
    }
}