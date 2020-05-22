/** Core imports */
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import * as ngCommon from '@angular/common';
import { FormsModule } from '@angular/forms';

/** Third party modules */
import { ModalModule, TabsModule, TooltipModule, PopoverModule } from 'ngx-bootstrap';
import { FileUploadModule as PrimeNgFileUploadModule, ProgressBarModule, PaginatorModule } from 'primeng/primeng';
import { TableModule } from 'primeng/table';
import { FileUploadModule } from '@node_modules/ng2-file-upload';
import { DxDataGridModule } from 'devextreme-angular/ui/data-grid';
import { DxScrollViewModule } from 'devextreme-angular/ui/scroll-view';
import { DxSelectBoxModule } from 'devextreme-angular/ui/select-box';
import { DxCheckBoxModule } from 'devextreme-angular/ui/check-box';

/** Application imports */
import { SmsVerificationModalComponent } from '@app/shared/layout/profile/sms-verification-modal.component';
import { HeaderNotificationsComponent } from './notifications/header-notifications/header-notifications.component';
import { LoginAttemptsModalComponent } from './login-attempts-modal/login-attempts-modal.component';
import { ChangePasswordModalComponent } from './profile/change-password-modal.component';
import { MySettingsModalComponent } from './profile/my-settings-modal.component';
import { NotificationsComponent } from './notifications/notifications.component';
import { NotificationSettingsModalComponent } from './notifications/notification-settings-modal/notification-settings-modal.component';
import { UserNotificationHelper } from './notifications/UserNotificationHelper';
import { AppCommonModule } from '@app/shared/common/app-common.module';
import { CommonModule } from '@shared/common/common.module';
import { UtilsModule } from '@shared/utils/utils.module';
import { ModalDialogModule } from '@shared/common/dialogs/modal/modal-dialog.module';
import { CountryPhoneNumberModule } from '@shared/common/phone-numbers/country-phone-number.module';

let COMPONENTS = [
    HeaderNotificationsComponent,
    LoginAttemptsModalComponent,
    ChangePasswordModalComponent,
    MySettingsModalComponent,
    NotificationsComponent,
    NotificationSettingsModalComponent,
    SmsVerificationModalComponent
];

@NgModule({
    imports: [
        ngCommon.CommonModule,
        FormsModule,
        RouterModule,
        AppCommonModule,
        ModalModule.forRoot(),
        TooltipModule.forRoot(),
        TabsModule.forRoot(),
        PopoverModule.forRoot(),
        UtilsModule,
        FileUploadModule,
        CommonModule,
        PrimeNgFileUploadModule,
        ProgressBarModule,
        TableModule,
        PaginatorModule,
        DxScrollViewModule,
        DxSelectBoxModule,
        DxCheckBoxModule,
        DxDataGridModule,
        ModalDialogModule,
        CountryPhoneNumberModule
    ],
    declarations: COMPONENTS,
    exports: COMPONENTS,
    providers: [
        UserNotificationHelper
    ],
    entryComponents: [
        MySettingsModalComponent,
        ChangePasswordModalComponent,
        NotificationSettingsModalComponent,
        NotificationsComponent,
        LoginAttemptsModalComponent
    ]
})
export class LayoutCommonModule {}
