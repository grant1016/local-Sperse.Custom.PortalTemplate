/** Core imports */
import { Injectable } from '@angular/core';

/** Third party imports */
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';
import { filter, pluck } from 'rxjs/operators';

/** Application imports */
import { MySettingsModalComponent } from 'app/shared/layout/profile/my-settings-modal.component';
import { UploadPhotoDialogComponent } from 'app/shared/common/upload-photo-dialog/upload-photo-dialog.component';
import {
    LayoutType,
    ProfileServiceProxy,
    UpdateProfilePictureInput,
    UserLinkServiceProxy
} from 'shared/service-proxies/service-proxies';
import { StringHelper } from 'shared/helpers/StringHelper';
import { AppConsts } from 'shared/AppConsts';
import { ChangePasswordModalComponent } from 'app/shared/layout/profile/change-password-modal.component';
import { AppAuthService } from 'shared/common/auth/app-auth.service';
import { LoginAttemptsModalComponent } from 'app/shared/layout/login-attempts-modal/login-attempts-modal.component';
import { UserHelper } from 'app/shared/helpers/UserHelper';
import { AppSessionService } from 'shared/common/session/app-session.service';
import { Observable } from '@node_modules/rxjs';
import { FeatureCheckerService } from '@abp/features/feature-checker.service';
import { AbpSessionService } from '@abp/session/abp-session.service';
import { environment } from 'environments/environment';
import { AppFeatures } from '@shared/AppFeatures';
import { UserDropdownMenuItemType } from '@shared/common/layout/user-management-list/user-dropdown-menu/user-dropdown-menu-item-type';
import { AppLocalizationService } from '@app/shared/common/localization/app-localization.service';
import { AppPermissions } from '@shared/AppPermissions';
import { PermissionCheckerService } from '@abp/auth/permission-checker.service';
import { Router } from '@angular/router';
import { UserDropdownMenuItemModel } from '@shared/common/layout/user-management-list/user-dropdown-menu/user-dropdown-menu-item.model';
import { ProfileService } from '@shared/common/profile-service/profile.service';

@Injectable()
export class UserManagementService {
    helpLink = location.protocol + '//' + abp.setting.values['Integrations:Zendesk:AccountUrl'];
    isImpersonatedLogin = this.abpSessionService.impersonatorUserId > 0;
    hasPlatformPermissions = (this.feature.isEnabled(AppFeatures.CFO) && this.permissionChecker.isGranted(AppPermissions.CFO)) ||
                             (this.feature.isEnabled(AppFeatures.CRM) && this.permissionChecker.isGranted(AppPermissions.CRM)) ||
                             (this.feature.isEnabled(AppFeatures.Admin) && this.permissionChecker.isGranted(AppPermissions.AdministrationUsers));
    defaultDropDownItems: UserDropdownMenuItemModel[] = [
        {
            name: this.ls.l('ChangePassword'),
            id: 'UserProfileChangePasswordLink',
            iconClass: 'flaticon-more-v6',
            onClick: (e) => this.changePassword(e)
        },
        {
            name: this.ls.l('LoginAttempts'),
            id: 'ShowLoginAttemptsLink',
            iconClass: 'flaticon-list',
            onClick: (e) => this.showLoginAttempts(e)
        },
        {
            name: this.ls.l('ChangeProfilePicture'),
            id: 'UserProfileChangePictureLink',
            iconClass: 'flaticon-profile-1',
            onClick: (e) => this.changeProfilePicture(e)
        },
        {
            name: this.ls.l('MySettings'),
            id: 'UserProfileMySettingsLink',
            iconClass: 'flaticon-cogwheel',
            onClick: (e) => this.changeMySettings(e)
        },
        {
            name: this.ls.l('Help'),
            iconClass: 'flaticon-info',
            onClick: () => {
                window.open(this.helpLink, '_blank');
            }
        },
        {
            type: UserDropdownMenuItemType.Separator,
        },
        {
            name: this.ls.l('Logout'),
            onClick: () => this.logout(),
            cssClass: 'bottom-logout',
            iconSrc: 'assets/common/icons/logout.svg'
        }
    ];
    constructor(
        private dialog: MatDialog,
        private authService: AppAuthService,
        private appSession: AppSessionService,
        private profileServiceProxy: ProfileServiceProxy,
        private userLinkServiceProxy: UserLinkServiceProxy,
        private feature: FeatureCheckerService,
        private abpSessionService: AbpSessionService,
        private ls: AppLocalizationService,
        private permissionChecker: PermissionCheckerService,
        private router: Router,
        private profileService: ProfileService
    ) {}

    changePassword(e): void {
        this.dialog.open(ChangePasswordModalComponent, {
            panelClass: ['slider', 'user-info'],
            disableClose: true,
            closeOnNavigation: false,
            data: {}
        });
        if (e.stopPropagation) {
            e.stopPropagation();
        }
    }

    changeProfilePicture(e): void {
        this.dialog.open(UploadPhotoDialogComponent, {
            data: {
                source: this.profileService.getProfilePictureUrl(this.appSession.user.profilePictureId),
                maxSizeBytes: AppConsts.maxImageSize
            },
            hasBackdrop: true
        }).afterClosed()
            .pipe(filter(result => result))
            .subscribe((result) => {
                if (result.clearPhoto) {
                    this.profileServiceProxy.clearProfilePicture()
                        .subscribe(() => {
                            this.handleProfilePictureChange(null);
                        });
                } else {
                    const base64OrigImage = StringHelper.getBase64(result.origImage),
                        base64ThumbImage = StringHelper.getBase64(result.thumImage);
                    this.profileServiceProxy.updateProfilePicture(UpdateProfilePictureInput.fromJS({
                        originalImage: base64OrigImage,
                        thumbnail: base64ThumbImage,
                        source: result.source
                    })).subscribe(thumbnailId => {
                        this.handleProfilePictureChange(thumbnailId);
                    });
                }
            });
        if (e.stopPropagation) {
            e.stopPropagation();
        }
    }

    private handleProfilePictureChange(thumbnailId: string) {
        abp.event.trigger('profilePictureChanged', thumbnailId);
    }

    changeMySettings(e): void {
        this.dialog.open(MySettingsModalComponent, {
            panelClass: ['slider', 'user-info'],
            disableClose: true,
            closeOnNavigation: false,
            data: {}
        });
        if (e.stopPropagation) {
            e.stopPropagation();
        }
    }

    isLayout(layoutType: LayoutType): boolean {
        return !!(this.appSession.tenant && this.appSession.tenant.customLayoutType === layoutType);
    }

    showLoginAttempts(e): void {
        this.dialog.open(LoginAttemptsModalComponent, {
            panelClass: ['slider', 'user-info'],
            disableClose: true,
            closeOnNavigation: false,
            data: {}
        });
        if (e.stopPropagation) {
            e.stopPropagation();
        }
    }

    logout(): void {
        this.authService.logout(true);
    }

    checkSecondDomainLevel(domain) {
        return domain.indexOf(location.hostname.split('.').slice(-2).join('.')) >= 0;
    }

    get notificationEnabled(): boolean {
        return (!this.abpSessionService.tenantId || this.feature.isEnabled(AppFeatures.Notification));
    }
}