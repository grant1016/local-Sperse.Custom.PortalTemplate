import { Component, Inject } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';

import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { AppConsts } from '@shared/AppConsts';
import { AppLocalizationService } from '@app/shared/common/localization/app-localization.service';

@Component({
    selector: 'app-add-link-dialog',
    templateUrl: './add-link-dialog.component.html',
    styleUrls: ['./add-link-dialog.component.less']
})
export class AddLinkDialogComponent {
    url = new FormControl(
        '',
        [
            Validators.required,
            Validators.pattern(AppConsts.regexPatterns.extendedSiteUrl)]
    );

    constructor(
        public ls: AppLocalizationService,
        public dialogRef: MatDialogRef<AddLinkDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { link: string } ) {
    }

    onNoClick(): void {
        this.dialogRef.close();
    }
}
