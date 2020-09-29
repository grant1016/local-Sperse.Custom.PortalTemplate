/** Core imports */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

/** Third party imports */
import { MatTabsModule } from '@angular/material/tabs';
import { MatExpansionModule } from '@angular/material/expansion';
import { DxDataGridModule } from 'devextreme-angular/ui/data-grid';
import { DxSelectBoxModule } from 'devextreme-angular/ui/select-box';
import { DxTextBoxModule } from 'devextreme-angular/ui/text-box';
import { DxNumberBoxModule } from 'devextreme-angular/ui/number-box';
import { DxValidatorModule } from 'devextreme-angular/ui/validator';

/** Application imports */
import { ReferralComponent } from './referral.component';
import { CommissionHistoryComponent } from '@shared/common/referral/commission-history/commission-history.component';
import { LedgerBalanceComponent } from '@shared/common/referral/ledger-balance/ledger-balance.component';
import { LinkGeneratorComponent } from '@shared/common/referral/link-generator/link-generator.component';
import { LinkTrackingComponent } from '@shared/common/referral/link-tracking/link-tracking.component';
import { ReferralRoutingModule } from '@shared/common/referral/referral-routing.module';
import { ReferralInfoComponent } from '@shared/common/referral/referral-info/referral-info.component';
import { UserPhotoModule } from '@app/shared/common/user-photo/user-photo.module';
import { InplaceEditModule } from '@app/shared/common/inplace-edit/inplace-edit.module';
import { DxDataGridDirective } from '@shared/common/dx-data-grid/dx-data-grid.directive';
import { CommissionAmountsComponent } from '@shared/common/referral/commission-amounts/commission-amounts.component';
import { CommissionAmountBlockComponent } from '@shared/common/referral/commission-amounts/commission-amount-block/commission-amount-block.component';
import { CommissionAmountItemComponent } from '@shared/common/referral/commission-amounts/commission-amount-item/commission-amount-item.component';
import { BeginOverlayModule } from '@shared/common/begin-overlay/begin-overlay.module';

@NgModule({
    imports: [
        CommonModule,
        DxDataGridModule,
        DxTextBoxModule,
        DxNumberBoxModule,
        DxSelectBoxModule,
        DxValidatorModule,
        MatTabsModule,
        ReferralRoutingModule,
        UserPhotoModule,
        MatExpansionModule,
        InplaceEditModule,
        BeginOverlayModule
    ],
    exports: [ DxDataGridDirective ],
    declarations: [
        CommissionHistoryComponent,
        LedgerBalanceComponent,
        LinkGeneratorComponent,
        LinkTrackingComponent,
        ReferralComponent,
        ReferralInfoComponent,
        DxDataGridDirective,
        CommissionAmountsComponent,
        CommissionAmountBlockComponent,
        CommissionAmountItemComponent
    ],
    providers: [],
    bootstrap: [ ReferralComponent ]
})
export class ReferralModule {
}
