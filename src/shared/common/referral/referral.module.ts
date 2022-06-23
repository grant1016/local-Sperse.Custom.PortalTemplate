/** Core imports */
import { NgModule } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';

/** Third party imports */
import { MatTabsModule } from '@angular/material/tabs';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDialogModule } from '@angular/material/dialog';
import { DxDataGridModule } from 'devextreme-angular/ui/data-grid';
import { DxSelectBoxModule } from 'devextreme-angular/ui/select-box';
import { DxTextBoxModule } from 'devextreme-angular/ui/text-box';
import { DxNumberBoxModule } from 'devextreme-angular/ui/number-box';
import { DxValidatorModule } from 'devextreme-angular/ui/validator';
import { DxScrollViewModule } from 'devextreme-angular/ui/scroll-view';

/** Application imports */
import { ReferralComponent, ReferralAdDirective } from './referral.component';
import { ReferralLayoutBaseComponent } from './referral-layout-base.component';
import { ReferralLayoutLightComponent } from './referral-layout-light.component';
import { 
    CommissionHistoryComponent, 
    CommissionHistoryAdDirective 
} from '@shared/common/referral/commission-history/commission-history.component';
import { CommissionHistoryLayoutBaseComponent } from '@shared/common/referral/commission-history/commission-history-layout-base.component';
import { CommissionHistoryLayoutLightComponent } from '@shared/common/referral/commission-history/commission-history-layout-light.component';
import { LedgerBalanceComponent } from '@shared/common/referral/ledger-balance/ledger-balance.component';
import { LinkGeneratorComponent } from '@shared/common/referral/link-generator/link-generator.component';
import { LinkTrackingComponent } from '@shared/common/referral/link-tracking/link-tracking.component';
import { ReferralRoutingModule } from '@shared/common/referral/referral-routing.module';
import { 
    ReferralInfoComponent, 
    ReferralInfoAdDirective 
} from '@shared/common/referral/referral-info/referral-info.component';
import { ReferralInfoLayoutBaseComponent } from '@shared/common/referral/referral-info/referral-info-layout-base.component';
import { ReferralInfoLayoutLightComponent } from '@shared/common/referral/referral-info/referral-info-layout-light.component';
import { UserPhotoModule } from '@app/shared/common/user-photo/user-photo.module';
import { InplaceEditModule } from '@app/shared/common/inplace-edit/inplace-edit.module';
import { DxDataGridDirective } from '@shared/common/dx-data-grid/dx-data-grid.directive';
import { 
    CommissionAmountsComponent, 
    CommissionAmountsAdDirective } from '@shared/common/referral/commission-amounts/commission-amounts.component';
import { CommissionAmountsLayoutBaseComponent } from '@shared/common/referral/commission-amounts/commission-amounts-layout-base.component';
import { CommissionAmountsLayoutLightComponent } from '@shared/common/referral/commission-amounts/commission-amounts-layout-light.component';
import { CommissionAmountBlockComponent } from '@shared/common/referral/commission-amounts/commission-amount-block/commission-amount-block.component';
import { CommissionAmountItemComponent } from '@shared/common/referral/commission-amounts/commission-amount-item/commission-amount-item.component';
import { WithdrawalDialogComponent } from '@shared/common/referral/commission-amounts/withdrawal-dialog/withdrawal-dialog.component';
import { ReferralExportService } from '@shared/common/referral/referral-export.service';
import { ReferralService } from '@shared/common/referral/referral.service';
import { UserCommissionServiceProxy } from '@shared/service-proxies/service-proxies';

@NgModule({
    imports: [
        CommonModule,
        DxDataGridModule,
        DxTextBoxModule,
        DxNumberBoxModule,
        DxSelectBoxModule,
        DxValidatorModule,
        DxScrollViewModule,
        MatTabsModule,
        MatDialogModule,
        ReferralRoutingModule,
        UserPhotoModule,
        MatExpansionModule,
        InplaceEditModule
    ],
    exports: [ DxDataGridDirective ],
    declarations: [
        CommissionHistoryComponent,
        CommissionHistoryAdDirective,
        CommissionHistoryLayoutBaseComponent,
        CommissionHistoryLayoutLightComponent,
        LedgerBalanceComponent,
        LinkGeneratorComponent,
        LinkTrackingComponent,
        ReferralComponent,
        ReferralAdDirective,
        ReferralLayoutBaseComponent,
        ReferralLayoutLightComponent,
        ReferralInfoComponent,
        ReferralInfoAdDirective,
        ReferralInfoLayoutBaseComponent,
        ReferralInfoLayoutLightComponent,
        DxDataGridDirective,
        CommissionAmountsComponent,
        CommissionAmountsAdDirective,
        CommissionAmountsLayoutBaseComponent,
        CommissionAmountsLayoutLightComponent,
        CommissionAmountBlockComponent,
        CommissionAmountItemComponent,
        WithdrawalDialogComponent
    ],
    providers: [ 
        CurrencyPipe, 
        DatePipe, 
        ReferralExportService, 
        ReferralService, 
        UserCommissionServiceProxy,
        {provide: 'layout', useValue: 'light'}
    ],
    entryComponents: [ WithdrawalDialogComponent ],
    bootstrap: [ ReferralComponent ]
})
export class ReferralModule {}