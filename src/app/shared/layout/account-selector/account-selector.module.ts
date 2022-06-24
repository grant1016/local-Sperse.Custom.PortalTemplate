/** Core imports */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

/** Third party imports */
import { DxDropDownBoxModule } from 'devextreme-angular/ui/drop-down-box';
import { DxTextBoxModule } from 'devextreme-angular/ui/text-box';
import { DxListModule } from 'devextreme-angular/ui/list';

/** Application imports */
import { AccountSelectorComponent } from './account-selector.component';
import { AccountSelectorService } from './account-selector.service';

@NgModule({
    imports: [
        CommonModule,
        DxDropDownBoxModule,
        DxTextBoxModule,
        DxListModule
    ],
    declarations: [
        AccountSelectorComponent
    ],
    exports: [
        AccountSelectorComponent
    ],
    providers: [
        AccountSelectorService
    ]
})
export class AccountSelectorModule {}