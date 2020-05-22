import { Component, Inject, OnInit } from '@angular/core';

import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';

import { environment } from 'environments/environment';
import { AppLocalizationService } from '@app/shared/common/localization/app-localization.service';

@Component({
    selector: 'app-register-confirm',
    templateUrl: './register-confirm.component.html',
    styleUrls: ['./register-confirm.component.less']
})
export class RegisterConfirmComponent implements OnInit {
    agreeWithTerms = true;
    modalsData = {
        terms: { title: 'Terms of Use', bodyUrl: environment.publicUrl + '/documents/terms.html', downloadDisabled: true },
        privacy: { title: 'Privacy Policy', bodyUrl: environment.publicUrl + '/documents/policy.html', downloadDisabled: true }
    };
    constructor(
        private dialog: MatDialog,
        @Inject(MAT_DIALOG_DATA) public data: any,
        public ls: AppLocalizationService
    ) {}

    ngOnInit() {}

    openConditionsDialog(event, data: any) {
        event.preventDefault();
    }
}