/** Core imports */
import { NgModule } from '@angular/core';
import * as ngCommon from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

/** Third party imports */
import { MatDialogModule } from '@angular/material/dialog';

/** Application imports */
import { CacheHelper } from '@shared/common/cache-helper/cache-helper';
import { CalendarComponent } from './widgets/calendar/calendar.component';
import { ConditionsModalComponent } from '@shared/common/conditions-modal/conditions-modal.component';
import { ConditionsModalService } from '@shared/common/conditions-modal/conditions-modal.service';
import { ZipCodeFormatterPipe } from '@shared/common/pipes/zip-code-formatter/zip-code-formatter.pipe';
import { CustomNumberPipe } from './pipes/custom-number/custom-number.pipe';
import { AddressFormatPipe } from './pipes/address-format.pipe';
import { FileSizePipe } from './pipes/file-size.pipe';
import { TitleCasePipe } from './pipes/title-case/title-case.pipe';
import { AppUrlService } from '@shared/common/nav/app-url.service';
import { RegisterConfirmComponent } from '@shared/common/dialogs/register-confirm/register-confirm.component';
import { NoDataModule } from '@shared/common/widgets/no-data/no-data.module';
import { PrimengTableHelper } from '@shared/helpers/PrimengTableHelper';
import { ModalDialogModule } from './dialogs/modal/modal-dialog.module';
import { CountryPhoneNumberModule } from './phone-numbers/country-phone-number.module';
import { PhoneFormatModule } from '@shared/common/pipes/phone-format/phone-format.module';
import { NumberToWordsPipe } from './pipes/number-to-words/number-to-words.pipe';
import { DateTimeModule } from '@shared/common/pipes/datetime/datetime.module';
import { DateTimePipe } from '@shared/common/pipes/datetime/datetime.pipe';

@NgModule({
    declarations: [
        CustomNumberPipe,
        AddressFormatPipe,
        FileSizePipe,
        ZipCodeFormatterPipe,
        TitleCasePipe,
        RegisterConfirmComponent,
        ConditionsModalComponent,
        CalendarComponent,
        NumberToWordsPipe        
    ],
    exports: [
        CustomNumberPipe,
        AddressFormatPipe,
        FileSizePipe,
        ZipCodeFormatterPipe,
        TitleCasePipe,
        NoDataModule,
        CalendarComponent,
        ConditionsModalComponent,
        RegisterConfirmComponent,
        NumberToWordsPipe,
        DateTimePipe
    ],
    imports: [
        ngCommon.CommonModule,
        NoDataModule,
        RouterModule,
        FormsModule,
        MatDialogModule,
        ModalDialogModule,
        PhoneFormatModule,
        CountryPhoneNumberModule,
        DateTimeModule
    ],
    entryComponents: [
        ConditionsModalComponent
    ],
    providers: [
        AppUrlService,
        PrimengTableHelper,
        CacheHelper,
        ConditionsModalService
    ]
})
export class CommonModule {}
