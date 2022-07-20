/** Core imports */
import { Component, Inject, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';

/** Third party imports */
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { filter } from 'rxjs/operators';

/** Application imports */
import { AppConsts } from '@shared/AppConsts';
import { UploadPhotoResult } from '@app/shared/common/upload-photo-dialog/upload-photo-result.interface';
import { UploadPhotoDialogComponent } from '@app/shared/common/upload-photo-dialog/upload-photo-dialog.component';
import { CountryPhoneNumberComponent } from '@shared/common/phone-numbers/country-phone-number.component';
import { AppLocalizationService } from '@app/shared/common/localization/app-localization.service';
import { AffiliateLinkInfo } from '@shared/service-proxies/service-proxies';

@Component({
    selector: 'app-add-link-dialog',
    templateUrl: './add-link-dialog.component.html',
    styleUrls: ['./add-link-dialog.component.less']
})
export class AddLinkDialogComponent {
    @ViewChild(CountryPhoneNumberComponent, { static: false }) phoneNumber: CountryPhoneNumberComponent;

    url = new FormControl(
        '', [
            Validators.required,
            Validators.pattern(AppConsts.regexPatterns.extendedSiteUrl)
        ]
    );
    category = new FormControl('', []);
    companyName = new FormControl('', []);
    suggestedCopy = new FormControl('', []);

    constructor(
        private dialog: MatDialog,
        public ls: AppLocalizationService,
        public dialogRef: MatDialogRef<AddLinkDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: AffiliateLinkInfo) {
    }

    openUploadDialog() {
        return this.dialog.open(UploadPhotoDialogComponent, {
            data: {
                source: this.data.imageUrl,
                maxSizeBytes: AppConsts.maxImageSize,
                title: this.ls.l('Change Link Icon')
            },
            hasBackdrop: true
        }).afterClosed().pipe(
            filter(Boolean)
        ).subscribe((result: UploadPhotoResult) => {
            if (result && !result.clearPhoto) {
                this.data.imageUrl = result.thumbImage;
            }
        });
    }

    close(): void {
        this.dialogRef.close();
    }
}
