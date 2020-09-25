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
import { CountsAndTotalsModule } from '@shared/crm/dashboard-widgets/counts-and-totals/counts-and-totals.module';
import { ReferralInfoComponent } from '@shared/common/referral/referral-info/referral-info.component';
import { UserPhotoModule } from '@app/shared/common/user-photo/user-photo.module';
import { InplaceEditModule } from '@app/shared/common/inplace-edit/inplace-edit.module';
import { DxDataGridDirective } from '@shared/common/dx-data-grid/dx-data-grid.directive';

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
        CountsAndTotalsModule,
        UserPhotoModule,
        MatExpansionModule,
        InplaceEditModule
    ],
    exports: [ DxDataGridDirective ],
    declarations: [
        CommissionHistoryComponent,
        LedgerBalanceComponent,
        LinkGeneratorComponent,
        LinkTrackingComponent,
        ReferralComponent,
        ReferralInfoComponent,
        DxDataGridDirective
    ],
    providers: [],
    bootstrap: [ ReferralComponent ]
})
export class ReferralModule {
}
