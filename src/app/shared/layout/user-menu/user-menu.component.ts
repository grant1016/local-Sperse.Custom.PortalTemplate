/** Core imports */
import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';

/** Third party imports  */
import { MatDialog } from '@angular/material/dialog';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

/** Application imports  */
import { PaymentWizardComponent } from '@app/shared/common/payment-wizard/payment-wizard.component';
import { MySettingsModalComponent } from '@app/shared/layout/profile/my-settings-modal.component';
import { AppAuthService } from 'shared/common/auth/app-auth.service';
import { AppPermissionService } from '@shared/common/auth/permission.service';
import { AppLocalizationService } from '@app/shared/common/localization/app-localization.service';
import { AppConsts } from '@shared/AppConsts';
import { ContactServiceProxy, GetSourceContactInfoOutput } from '@shared/service-proxies/service-proxies';
import { ProfileService } from '@shared/common/profile-service/profile.service';
import { AppService } from '@app/app.service';
import { LayoutService } from '@app/shared/layout/layout.service';
import { AppSessionService } from '@shared/common/session/app-session.service';
import { ClipboardService } from '@node_modules/ngx-clipboard';
import { NotifyService } from 'abp-ng2-module';

@Component({
    selector: 'user-menu',
    templateUrl: 'user-menu.component.html',
    styleUrls: [ 'user-menu.component.less' ],
    providers: [ContactServiceProxy],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserMenuComponent {
    helpLink = location.protocol + '//' + abp.setting.values['Integrations:Zendesk:AccountUrl'];
    affiliateCode$: Observable<string> = this.profileService.accessCode$;
    affiliateValidationRules = [
        {
            type: 'pattern',
            pattern: AppConsts.regexPatterns.affiliateCode,
            message: this.ls.l('AffiliateCodeIsNotValid')
        },
        {
            type: 'stringLength',
            max: AppConsts.maxAffiliateCodeLength,
            message: this.ls.l('MaxLengthIs', AppConsts.maxAffiliateCodeLength)
        }
    ];
    profilePictureUrl$: Observable<string> = this.profileService.profilePictureUrl$;
    navigationItems;

    constructor(
        private dialog: MatDialog,
        private changeDetectorRef: ChangeDetectorRef,
        private permissionService: AppPermissionService,
        private contactProxy: ContactServiceProxy,
        private profileService: ProfileService,
        private clipboardService: ClipboardService,
        private notifyService: NotifyService,
        public authService: AppAuthService,
        public ls: AppLocalizationService,
        public appService: AppService,
        public appSession: AppSessionService
    ) {
        this.appService.subscribeModuleChange(config => {
            if (config) {
                this.navigationItems = config.navigation.map(item => {
                    item.text = this.ls.l(item.text);
                    if (this.checkMenuItemPermission(item))
                        return item;
                }).filter(Boolean);
                this.navigationItems.splice(2, 0, {
                    icon: 'dollar',
                    text: 'My Subscriptions',
                    route: 'subscriptions'
                });
            }
        });
    }

    private checkMenuItemPermission(item): boolean {
        return (!item.feature || this.appService.isFeatureEnable(item.feature)) && 
            (!item.permission || this.permissionService.isGranted(item.permission));
    }

    updateAffiliateCode(value): void {
        this.profileService.updateAccessCode(value);
        this.changeDetectorRef.markForCheck();
    }

    getThumbnailSrc(thumbnailId?: string): string {
        return this.profileService.getContactPhotoUrl(thumbnailId, true);
    }

    saveToClipboard(event, value) {
        this.clipboardService.copyFromContent(value);
        this.notifyService.info(this.ls.l('SavedToClipboard'));
        event.stopPropagation();
    }

    changeMySettings() {
        this.dialog.open(MySettingsModalComponent, {
            panelClass: ['slider', 'user-info'],
            disableClose: true,
            closeOnNavigation: false,
            data: {}
        });
    }

    navigate(item, event) {
        let route = item.route;
        if (!route.startsWith('/')) {
            if (route.startsWith('platform')) {
                this.authService.setTokenBeforeRedirect();
                location.href = AppConsts.remoteServiceBaseUrl;
            } else if (route.startsWith('subscriptions')) {
                this.openPaymentWizardDialog(event);
            } else
                window.open(route, '_blank');
        }
    }

    openPaymentWizardDialog(event) {
        this.dialog.open(PaymentWizardComponent, {
            height: '800px',
            width: '1200px',
            id: 'payment-wizard',
            panelClass: ['payment-wizard', 'setup'],
            data: {
                showSubscriptions: true,
                module: this.appService.getModuleSubscription().module
            }
        }).afterClosed().subscribe(() => { });
        event.stopPropagation();
    }
}