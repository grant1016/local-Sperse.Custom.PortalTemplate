import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { takeUntil } from 'rxjs/operators';

import { ProfileService } from '@shared/common/profile-service/profile.service';
import { UserManagementService } from '@shared/common/layout/user-management-list/user-management.service';
import { LifecycleSubjectsService } from '@shared/common/lifecycle-subjects/lifecycle-subjects.service';

@Component({
    selector: 'user-photo',
    templateUrl: 'user-photo.component.html',
    styleUrls: [ 'user-photo.component.less' ],
    providers: [ LifecycleSubjectsService ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserPhotoComponent {
    @Input() uploadAfterSave = true;
    @Input() profilePictureUrl: string;

    constructor(
        private profileService: ProfileService,
        private userManagementService: UserManagementService,
        private lifeCycleSubjectService: LifecycleSubjectsService
    ) {}

    changeProfilePicture(e: MouseEvent) {
        this.userManagementService.changeProfilePicture(e, this.uploadAfterSave).pipe(
            takeUntil(this.lifeCycleSubjectService.destroy$)
        ).subscribe((base64OrigImage: string) => {
            this.profileService.updatePictureUrl(base64OrigImage
                ? this.profileService.getPhoto(base64OrigImage)
                : this.profileService.getProfilePictureUrl(null));
        })
    }
}