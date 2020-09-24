import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ProfileService } from '@shared/common/profile-service/profile.service';
import { UserManagementService } from '@shared/common/layout/user-management-list/user-management.service';

@Component({
    selector: 'user-photo',
    templateUrl: 'user-photo.component.html',
    styleUrls: [ 'user-photo.component.less' ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserPhotoComponent {
    @Input() uploadAfterSave = true;
    @Input() profilePictureUrl: string;
    constructor(
        private profileService: ProfileService,
        private userManagementService: UserManagementService
    ) {}

    changeProfilePicture(e: MouseEvent) {
        this.userManagementService.changeProfilePicture(e);
    }
}