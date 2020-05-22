/** Core imports */
import {
    ApplicationRef,
    ChangeDetectorRef,
    Component,
    ElementRef,
    Injector,
    Input,
    ViewChild
} from '@angular/core';

/** Third party imports */

/** Application imports */
import {
    CommonUserInfoServiceProxy,
    MemberSettingsServiceProxy,
    UpdateUserAffiliateCodeDto
} from 'shared/service-proxies/service-proxies';
import { UserManagementService } from 'shared/common/layout/user-management-list/user-management.service';
import { UserDropdownMenuItemType } from 'shared/common/layout/user-management-list/user-dropdown-menu/user-dropdown-menu-item-type';
import { UserDropdownMenuItemModel } from 'shared/common/layout/user-management-list/user-dropdown-menu/user-dropdown-menu-item.model';
/** @todo Used for chart bar and dropdown. Reimplement in future */
import 'assets/metronic/src/js/framework/base/util.js';
import 'assets/metronic/src/js/framework/components/general/dropdown.js';
import { AppSessionService } from '@shared/common/session/app-session.service';
import { AppFeatures } from '@shared/AppFeatures';
import { FeatureCheckerService } from '@abp/features/feature-checker.service';
import { AppLocalizationService } from '@app/shared/common/localization/app-localization.service';
import { ProfileService } from '@shared/common/profile-service/profile.service';
import { AppConsts } from '@shared/AppConsts';

@Component({
    selector: 'user-dropdown-menu',
    templateUrl: './user-dropdown-menu.component.html',
    styleUrls: [
        '../../../../../assets/metronic/src/vendors/flaticon/css/flaticon.css',
        '../../../../metronic/m-nav.less',
        './user-dropdown-menu.component.less'
    ],
    providers: [ CommonUserInfoServiceProxy, MemberSettingsServiceProxy ]
})
export class UserDropdownMenuComponent {
    @ViewChild('topBarUserProfile', { static: false }) topBarUserProfile: ElementRef;
    @Input() subtitle: string;
    @Input() dropdownMenuItems: UserDropdownMenuItemModel[] = this.getDropDownItems();
    private commonUserInfoService: CommonUserInfoServiceProxy;
    profileThumbnailId = this.appSession.user.profileThumbnailId;
    shownLoginInfo: { fullName, email, tenantName? } = this.appSession.getShownLoginInfo();
    menuItemTypes = UserDropdownMenuItemType;
    accessCode$ = this.profileService.accessCode$;
    accessCodeValidationRules = [
        {
            type: 'pattern',
            pattern: AppConsts.regexPatterns.affiliateCode,
            message: this.ls.l('AccessCodeIsNotValid')
        },
        {
            type: 'stringLength',
            max: AppConsts.maxAffiliateCodeLength,
            message: this.ls.l('MaxLengthIs', AppConsts.maxAffiliateCodeLength)
        }
    ];
    showAccessCode = false;
    isAccessCodeTooltipVisible = false;
    dropdownHeaderStyle: { [key: string]: string } = this.getDropdownHeaderStyle();

    constructor(
        injector: Injector,
        private applicationRef: ApplicationRef,
        private elementRef: ElementRef,
        private featureCheckerService: FeatureCheckerService,
        private changeDetectorRef: ChangeDetectorRef,
        private memberSettingsService: MemberSettingsServiceProxy,
        private userManagementService: UserManagementService,
        public profileService: ProfileService,
        public appSession: AppSessionService,
        public ls: AppLocalizationService
    ) {
        this.commonUserInfoService = injector.get(CommonUserInfoServiceProxy);
    }

    private getDropDownItems() {
        return this.userManagementService.defaultDropDownItems;
    }

    menuItemClick(menuItem, event) {
        menuItem.onClick(event);
        this.elementRef.nativeElement.childNodes[0]
            .classList.remove('m-dropdown--open');
    }

    getScrollHeight() {
        let height = innerHeight - 170;
        return height > 490 ? '100%' : height;
    }

    accessCodeChanged(accessCode: string) {
        this.profileService.updateAccessCode(accessCode);
        this.memberSettingsService.updateAffiliateCode(new UpdateUserAffiliateCodeDto({ affiliateCode: accessCode })).subscribe(
            () => {
                abp.notify.info(this.ls.l('AccessCodeUpdated'));
                this.appSession.user.affiliateCode = accessCode;
            },
            /** Update back if error comes */
            () => this.profileService.updateAccessCode(this.appSession.user.affiliateCode)
        );
    }

    onClick(e) {
        e.stopPropagation();
    }

    onInstructionsClick(e) {
        e.stopPropagation();
    }

    getDropdownHeaderStyle(): { [key: string]: string; } {
        let style = {
            background: '#00aeef',
            boxShadow: 'none'
        };
        return style;
    }
}