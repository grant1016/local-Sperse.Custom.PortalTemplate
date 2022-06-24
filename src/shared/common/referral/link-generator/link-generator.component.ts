/** Core imports */
import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Third party imports */
import { ClipboardService } from 'ngx-clipboard';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';

/** Application imports */
import { NotifyService } from 'abp-ng2-module';
import { AppLocalizationService } from '@app/shared/common/localization/app-localization.service';
import { ProfileService } from '@shared/common/profile-service/profile.service';
import { GeneratorLink } from '@shared/common/referral/link-generator/generator-link.interface';
import { SharingService } from '@shared/common/sharing-service/sharing.service';
import { AppConsts } from '@shared/AppConsts';
import { ReferralService } from '@shared/common/referral/referral.service';
import { AddLinkDialogComponent } from '../shared/add-link-dialog/add-link-dialog.component';

@Component({
    selector: 'link-generator',
    templateUrl: 'link-generator.component.html',
    styleUrls: [ 'link-generator.component.less' ],
    providers: [ SharingService ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LinkGeneratorComponent {
    accessCode$: Observable<string> = this.profileService.accessCode$;
    private _search: BehaviorSubject<string> = new BehaviorSubject<string>('');
    search$: Observable<string> = this._search.asObservable();
    initialLinks: GeneratorLink[] = [
        {
            "imgSrc": "https://www.google.com/s2/favicons?sz=24&domain_url=hoa.com",
            "category": "HOA.com Links",
            "companyName": "Loan Officers",
            "phoneNumber": "(888) 277-9935",
            "link": "https://hoa.com/LO?ref",
            "suggestedCopy": "Loan Officers, triple your referrals as a mortgage expert with HOA.com!"
        },
        {
            "imgSrc": "https://www.google.com/s2/favicons?sz=24&domain_url=hoa.com",
            "category": "HOA.com Links",
            "companyName": "Real Estate Agents",
            "phoneNumber": "(888) 277-9935",
            "link": "https://hoa.com/Realtors?ref",
            "suggestedCopy": "Real Estate Agents - Apply to Become an HOA.com Community Connector."
        },
        {
            "imgSrc": "https://www.google.com/s2/favicons?sz=24&domain_url=hoa.com",
            "category": "HOA.com Links",
            "companyName": "Become a Certified Pro",
            "phoneNumber": "(888) 277-9935",
            "link": "https://hoa.com/Pro?ref",
            "suggestedCopy": "Become a Certified Pro on the #1 Referral Network for home service professionals."
        },
        {
            "imgSrc": "https://www.google.com/s2/favicons?sz=24&domain_url=hoa.com",
            "category": "HOA.com Links",
            "companyName": "Grow Your Business",
            "phoneNumber": "(888) 277-9935",
            "link": "https://hoa.com/Grow?ref",
            "suggestedCopy": "Join the #1 Referral Network to Grow Your Business as an HOA.COM Pro."
        },
        {
            "imgSrc": "https://www.google.com/s2/favicons?sz=24&domain_url=hoa.com",
            "category": "HOA.com Links",
            "companyName": "Referral Rewards",
            "phoneNumber": "(888) 277-9935",
            "link": "https://hoa.com/win?ref",
            "suggestedCopy": "Earn lifetime commissions with Referral Partner program."
        },
        {
            "imgSrc": "https://www.google.com/s2/favicons?sz=24&domain_url=hoa.com",
            "category": "HOA.com Links",
            "companyName": "Business Services",
            "phoneNumber": "(888) 277-9935",
            "link": "https://hoa.com/business-services?ref",
            "suggestedCopy": "Business Services and a Premier Pro Snapshot for home service providers."
        },
        {
            "imgSrc": "https://www.google.com/s2/favicons?sz=24&domain_url=hoa.com",
            "category": "HOA.com Links",
            "companyName": "Alliance Leader",
            "phoneNumber": "(888) 277-9935",
            "link": "https://hoa.com/leader?ref",
            "suggestedCopy": "Apply to be an HOA.com Alliance Leader and expand your influence, impact, & income."
        },
        {
            "imgSrc": "https://www.google.com/s2/favicons?sz=24&domain_url=hoa.com",
            "category": "HOA.com Links",
            "companyName": "Local Business Alliances",
            "phoneNumber": "(888) 277-9935",
            "link": "https://hoa.com/alliances?ref",
            "suggestedCopy": "Join the HOA.com Local Business Alliances of top rated service based companies."
        },
        {
            "imgSrc": "https://www.google.com/s2/favicons?sz=24&domain_url=hoa.com",
            "category": "HOA.com Links",
            "companyName": "HOA.com Events",
            "phoneNumber": "(888) 277-9935",
            "link": "https://hoa.com/events?ref",
            "suggestedCopy": "Connect and collaborate with top trusted home service professionals by location."
        }
    ];
    initialLinks$: Observable<GeneratorLink[]> = this.accessCode$.pipe(
        map((accessCode: string) => this.initialLinks.map((link: GeneratorLink) => {
            link.copyYourReferralLink = link.link + (accessCode ? (link.link.includes('?') ? '=' : '/') + accessCode : '');

            return link;
        }))
    );
    displayedLinks$: Observable<GeneratorLink[]> = combineLatest(
        this.initialLinks$,
        this.search$
    ).pipe(
        map(([initialLinks, search]: [GeneratorLink[], string]) => {
            let terms = search.toLowerCase().split(' ');
            return initialLinks.filter((link: GeneratorLink) => {
                return terms.every(item => link.category.toLowerCase().includes(item))
                    || terms.every(item => link.companyName.toLowerCase().includes(item))
                    || terms.every(item => link.copyYourReferralLink.toLowerCase().includes(item))
                    || terms.every(item => link.suggestedCopy.toLowerCase().includes(item));
            });
        })
    );
    public window = window;

    constructor(
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
        this.referralService.addLink(link);
    }

    shareInLinkedIn(description: string, link: string) {
        this.sharingService.shareInLinkedin(link, description, '');
        this.referralService.addLink(link);
    }

    shareInTwitter(description: string, link: string) {
        this.sharingService.shareInTwitter(link, description);
        this.referralService.addLink(link);
    }

    shareInPinterest(description: string, link: string) {
        this.sharingService.shareInPinterest(
            link,
            AppConsts.appBaseHref + 'assets/common/images/hoa/login-bg.jpg',
            description
        );
        this.referralService.addLink(link);
    }

    shareByEmail(description: string, link: string) {
        this.sharingService.shareVieEmail(link, description);
        this.referralService.addLink(link);
    }

    addNewTrackingLink() {
        const dialogRef = this.dialog.open(AddLinkDialogComponent, {
            width: '525px',
            data: {
                link: ''
            }
        });
        dialogRef.afterClosed().subscribe(result => {
            result && this.referralService.addLink(result);
        });
    }
}