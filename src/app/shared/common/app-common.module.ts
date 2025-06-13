/** Core imports */
import * as ngCommon from '@angular/common';
import { NgModule, ModuleWithProviders } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

/** Third party imports */
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatStepperModule } from '@angular/material/stepper';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSliderModule } from '@angular/material/slider';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import { DxScrollViewModule } from 'devextreme-angular/ui/scroll-view';
import { DxDropDownBoxModule } from 'devextreme-angular/ui/drop-down-box';
import { DxListModule } from 'devextreme-angular/ui/list';
import { DxButtonModule } from 'devextreme-angular/ui/button';
import { DxToolbarModule } from 'devextreme-angular/ui/toolbar';
import { DxMenuModule } from 'devextreme-angular/ui/menu';
import { DxTextBoxModule } from 'devextreme-angular/ui/text-box';
import { DxValidationGroupModule } from 'devextreme-angular/ui/validation-group';
import { DxValidatorModule } from 'devextreme-angular/ui/validator';
import { DxSelectBoxModule } from 'devextreme-angular/ui/select-box';
import { DxTextAreaModule } from 'devextreme-angular/ui/text-area';
import { DxDataGridModule } from 'devextreme-angular/ui/data-grid';
import { DxContextMenuModule } from 'devextreme-angular/ui/context-menu';
import { DxTreeViewModule } from 'devextreme-angular/ui/tree-view';
import { DxRadioGroupModule } from 'devextreme-angular/ui/radio-group';
import { DxPopupModule } from 'devextreme-angular/ui/popup';
import { DxSliderModule } from 'devextreme-angular/ui/slider';
import { DxCheckBoxModule } from 'devextreme-angular/ui/check-box';
import { DxTabsModule } from 'devextreme-angular/ui/tabs';
import { DxTagBoxModule } from 'devextreme-angular/ui/tag-box';
import { DxProgressBarModule } from 'devextreme-angular/ui/progress-bar';
import { DxTooltipModule } from 'devextreme-angular/ui/tooltip';
import { DxSwitchModule } from 'devextreme-angular/ui/switch';
import { DxTreeListModule } from 'devextreme-angular/ui/tree-list';
import { DxPivotGridModule } from 'devextreme-angular/ui/pivot-grid';
import { DxChartModule } from 'devextreme-angular/ui/chart';

import { TableModule } from 'primeng/table';
import { PaginatorModule } from 'primeng/primeng';
import { ModalModule } from 'ngx-bootstrap';
import { TimeAgoPipe } from 'time-ago-pipe';
import { ImageCropperModule } from 'ngx-image-cropper';
import { NgxFileDropModule } from 'ngx-file-drop';
import { ModalDialogModule } from '@shared/common/dialogs/modal/modal-dialog.module';

/** Application imports */
import { AbpModule } from 'abp-ng2-module';
import { UtilsModule } from '@shared/utils/utils.module';
import { CommonModule } from '@shared/common/common.module';
import { PaymentsInfoComponent } from './payments-info/payments-info.component';
import { PaymentWizardComponent } from './payment-wizard/payment-wizard.component';
import { PaymentSubscriptionsComponent } from './payment-wizard/payment-subscriptions/payment-subscriptions.component';
import { PackageCardComponent } from './payment-wizard/package-chooser/package-card/package-card.component';
import { PackageChooserComponent } from './payment-wizard/package-chooser/package-chooser.component';
import { PaymentStatusComponent } from './payment-wizard/payment-status/payment-status.component';
import { PaymentOptionsComponent } from './payment-wizard/payment-options/payment-options.component';               
import { CreditCardComponent } from './payment-wizard/payment-options/credit-card/credit-card.component';
import { BankTransferComponent } from './payment-wizard/payment-options/bank-transfer/bank-transfer.component';
import { ECheckComponent } from './payment-wizard/payment-options/e-check/e-check.component';

import { UploadPhotoDialogComponent } from './upload-photo-dialog/upload-photo-dialog.component';
import { ConfirmDialogComponent } from './dialogs/confirm/confirm-dialog.component';
import { HeadLineComponent } from './headline/headline.component';
import { TimeZoneComboComponent } from './timing/timezone-combo.component';
import { JqPluginDirective } from './libs/jq-plugin.directive';
import { DateRangePickerComponent } from './timing/date-range-picker.component';
import { DatePickerDirective } from './timing/date-picker.component';
import { LoadingSpinnerModule } from '@app/shared/common/loading-spinner/loading-spinner.module';
import { InplaceEditModule } from '@app/shared/common/inplace-edit/inplace-edit.module';
import { CommonLookupModalComponent } from './lookup/common-lookup-modal.component';
import { CalendarButtonComponent } from '@app/shared/common/calendar-button/calendar-button.component';
import { CalendarDialogComponent } from './dialogs/calendar/calendar-dialog.component';
import { PeriodComponent } from './period/period.component';
import { ToolBarComponent } from './toolbar/toolbar.component';
import { ActionMenuModule } from './action-menu/action-menu.module';
import { PaypalModule } from '@shared/common/paypal/paypal.module';
import { SpreedlyPayButtonsModule } from '@shared/common/spreedly-pay-buttons/spreedly-pay-buttons.module';

@NgModule({
    imports: [
        ngCommon.CommonModule,
        FormsModule,
        ModalModule.forRoot(),
        UtilsModule,
        AbpModule,
        CommonModule,
        TableModule,
        PaginatorModule,
        RouterModule,

        MatTabsModule,
        MatInputModule,
        MatSidenavModule,
        MatDialogModule,
        MatFormFieldModule,
        MatProgressBarModule,
        MatStepperModule,
        MatButtonModule,
        MatSelectModule,
        MatTooltipModule,
        MatSliderModule,
        MatSlideToggleModule,
        MatAutocompleteModule,
        ReactiveFormsModule,
        MatDialogModule,
        LoadingSpinnerModule,
        InplaceEditModule,
        ImageCropperModule,
        NgxFileDropModule,
        ModalDialogModule,
        ActionMenuModule,
        PaypalModule,
        SpreedlyPayButtonsModule,

        DxListModule,
        DxCheckBoxModule,
        DxContextMenuModule,
        DxButtonModule,
        DxToolbarModule,
        DxDropDownBoxModule,
        DxMenuModule,
        DxTextBoxModule,
        DxValidationGroupModule,
        DxValidatorModule,
        DxSelectBoxModule,
        DxTextAreaModule,
        DxDataGridModule,
        DxContextMenuModule,
        DxTreeViewModule,
        DxPivotGridModule,
        DxChartModule,
        DxRadioGroupModule,
        DxTextBoxModule,
        DxDataGridModule,
        DxSelectBoxModule,
        MatDialogModule,
        DxContextMenuModule,
        DxTabsModule,
        DxTagBoxModule,
        DxPopupModule,
        DxProgressBarModule,
        DxTooltipModule,
        DxSwitchModule,
        DxTreeListModule,
        DxSliderModule,
        DxScrollViewModule
    ],
    declarations: [
        TimeAgoPipe,
        PeriodComponent,
        ToolBarComponent,
        TimeZoneComboComponent,
        JqPluginDirective,
        DateRangePickerComponent,
        DatePickerDirective,
        HeadLineComponent,
        UploadPhotoDialogComponent,
        ConfirmDialogComponent,
        CommonLookupModalComponent,
        CalendarButtonComponent,
        CalendarDialogComponent,
        PaymentsInfoComponent,
        PaymentWizardComponent,
        PaymentOptionsComponent,
        PaymentStatusComponent, 
        PackageChooserComponent, 
        PackageCardComponent,
        PaymentSubscriptionsComponent,
        BankTransferComponent,
        CreditCardComponent,
        ECheckComponent
    ],
    exports: [
        TimeAgoPipe,
        PeriodComponent,
        ToolBarComponent,
        TimeZoneComboComponent,
        JqPluginDirective,
        DateRangePickerComponent,
        DatePickerDirective,
        HeadLineComponent,
        UploadPhotoDialogComponent,
        ConfirmDialogComponent,
        CommonLookupModalComponent,
        CalendarButtonComponent,
        PaymentsInfoComponent,
        CalendarDialogComponent
    ],
    providers: [],
    entryComponents: [
        CalendarDialogComponent,
        UploadPhotoDialogComponent,
        ConfirmDialogComponent,
        CommonLookupModalComponent,
        PaymentWizardComponent  
    ]
})
export class AppCommonModule {
    static forRoot(): ModuleWithProviders<AppCommonModule> {
        return {
            ngModule: AppCommonModule,
            providers: []
        };
    }
}