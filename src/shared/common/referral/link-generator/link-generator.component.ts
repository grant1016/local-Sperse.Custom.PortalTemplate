/** Core imports */
import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Third party imports */
import { ClipboardService } from 'ngx-clipboard';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { map, switchMap } from 'rxjs/operators';

/** Application imports */
import { NotifyService } from 'abp-ng2-module';
import { AppPermissions } from '@shared/AppPermissions';
import { AppPermissionService } from '@shared/common/auth/permission.service';
import { AppLocalizationService } from '@app/shared/common/localization/app-localization.service';
import { ProfileService } from '@shared/common/profile-service/profile.service';
import { GeneratorLink } from '@shared/common/referral/link-generator/generator-link.interface';
import { SharingService } from '@shared/common/sharing-service/sharing.service';
import { AppConsts } from '@shared/AppConsts';
import { ReferralService } from '@shared/common/referral/referral.service';
import { AddLinkDialogComponent } from '../shared/add-link-dialog/add-link-dialog.component';
import { AffiliateLinkInfo, SetAffiliateLinkImageInput } from '@shared/service-proxies/service-proxies';
import { StringHelper } from '@shared/helpers/StringHelper';

@Component({
    selector: 'link-generator',
    templateUrl: 'link-generator.component.html',
    styleUrls: [ 'link-generator.component.less' ],
    providers: [ SharingService ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LinkGeneratorComponent {
    accessCode$: Observable<string> = this.profileService.accessCode$;
    private _refresh: BehaviorSubject<any> = new BehaviorSubject<any>(true);
    private _search: BehaviorSubject<string> = new BehaviorSubject<string>('');
    search$: Observable<string> = this._search.asObservable();
    initialLinks$: Observable<GeneratorLink[]> = this.accessCode$.pipe(
        switchMap((accessCode: string) => this._refresh.pipe(switchMap(() =>
            this.referralService.getLinks().pipe(
                map((links: AffiliateLinkInfo[]) => {
                    return links.map((link: AffiliateLinkInfo) => {
                        let linkInfo: GeneratorLink = <GeneratorLink>link;
                        linkInfo.copyYourReferralLink = link.url + (accessCode ? (link.url.includes('?') ? '=' : '/') + accessCode : '');
                        return linkInfo;
                    });
                })
            )
        ))
    ));
    displayedLinks$: Observable<GeneratorLink[]> = combineLatest(
        this.initialLinks$,
        this.search$
    ).pipe(
        map(([initialLinks, search]: [GeneratorLink[], string]) => {
            let terms = search.toLowerCase().split(' ');
            return initialLinks.filter((link: GeneratorLink) => {
                return link.category && terms.every(item => link.category.toLowerCase().includes(item))
                    || link.companyName && terms.every(item => link.companyName.toLowerCase().includes(item))
                    || link.copyYourReferralLink && terms.every(item => link.copyYourReferralLink.toLowerCase().includes(item))
                    || link.suggestedCopy && terms.every(item => link.suggestedCopy.toLowerCase().includes(item));
            });
        })
    );
    public window = window;
    manageAllowed = this.permissionService.isGranted(AppPermissions.CRMManageAffiliateLinks);

    constructor(
        private permissionService: AppPermissionService,
        private clipboardService: ClipboardService,
        private notifyService: NotifyService,
        public ls: AppLocalizationService,        
        private profileService: ProfileService,
        private sharingService: SharingService,
        private referralService: ReferralService,
        public dialog: MatDialog
    ) {
    }

    copy(link: string) {
        this.clipboardService.copyFromContent(link);
        this.notifyService.info(this.ls.l('SavedToClipboard'));
    }

    search(e) {
        this._search.next(e.value);
    }

    shareInFacebook(link: string) {
        this.sharingService.shareInFacebook(link);
    }

    shareInLinkedIn(description: string, link: string) {
        this.sharingService.shareInLinkedin(link, description, '');
    }

    shareInTwitter(description: string, link: string) {
        this.sharingService.shareInTwitter(link, description);
    }

    shareInPinterest(description: string, link: string) {
        this.sharingService.shareInPinterest(
            link,
            AppConsts.appBaseHref + 'assets/common/images/hoa/login-bg.jpg',
            description
        );
    }

    shareByEmail(description: string, link: string) {
        this.sharingService.shareVieEmail(link, description);
    }

    addEditNewLink(linkInfo?) {
        if (!this.manageAllowed)
            return ;

        const dialogRef = this.dialog.open(AddLinkDialogComponent, {
            width: '420px',
            data: new AffiliateLinkInfo(linkInfo || {})
        });
        dialogRef.afterClosed().subscribe(result => {
            if (result)
                this.referralService.addOrUpdateLink(result).subscribe((id?: number) => {
                    if (result.imageUrl && result.imageUrl.includes('base64'))
                        this.referralService.setAffiliateLinkImage(new SetAffiliateLinkImageInput({
                            affiliateLinkId: result.id || id,
                            image: StringHelper.getBase64(result.imageUrl)
                        })).subscribe(() => {
                            abp.notify.success(this.ls.l('SavedSuccessfully'));
                            this._refresh.next(true);
                        });
                    else {
                        abp.notify.success(this.ls.l('SavedSuccessfully'));
                        this._refresh.next(true);
                    }
                });
        });
    }
}