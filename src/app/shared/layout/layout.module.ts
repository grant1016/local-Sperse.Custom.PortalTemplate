/** Core imports */
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import * as ngCommon from '@angular/common';
import { FormsModule } from '@angular/forms';

/** Third party modules */
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDialogModule } from '@angular/material/dialog';
import { DxMenuModule } from 'devextreme-angular/ui/menu';
import { DxTooltipModule } from 'devextreme-angular/ui/tooltip';
import { DxButtonModule } from 'devextreme-angular/ui/button';
import { DxDropDownBoxModule } from 'devextreme-angular/ui/drop-down-box';
import { DxListModule } from 'devextreme-angular/ui/list';
import { DxScrollViewModule } from 'devextreme-angular/ui/scroll-view';
import { DxNavBarModule } from 'devextreme-angular/ui/nav-bar';
import { DxNumberBoxModule } from 'devextreme-angular/ui/number-box';
import { DxValidatorModule } from 'devextreme-angular/ui/validator';
import { ModalModule, TabsModule, TooltipModule, PopoverModule } from 'ngx-bootstrap';
import { FileUploadModule as PrimeNgFileUploadModule } from 'primeng/fileupload';
import { TableModule } from 'primeng/table';
import { ProgressBarModule } from 'primeng/progressbar';
import { PaginatorModule } from 'primeng/paginator';

/** Application imports */
import { FiltersModule } from '@shared/filters/filters.module';
import { LayoutCommonModule } from './layout-common.module';
import { HeaderComponent } from './header/header.component';
import { SideBarComponent } from './side-bar/side-bar.component';
import { TopBarComponent } from './top-bar/top-bar.component';
import { UtilsModule } from '@shared/utils/utils.module';
import { LayoutService } from '@app/shared/layout/layout.service';
import { UserManagementModule } from '@shared/common/layout/user-management-list/user-management.module';
import { UserMenuComponent } from './user-menu/user-menu.component';
import { CreditsTopupDialogComponent } from './user-menu/credits-topup-dialog/credits-topup-dialog.component';
import { UserPhotoModule } from '@app/shared/common/user-photo/user-photo.module';
import { InplaceEditModule } from '@app/shared/common/inplace-edit/inplace-edit.module';
import { AccountSelectorModule } from './account-selector/account-selector.module';

/** @todo Used for chart bar and dropdown. Reimplement in future */
import 'assets/metronic/src/js/framework/base/util.js';
import 'assets/metronic/src/js/framework/base/app.js';
import 'assets/metronic/src/js/framework/components/general/dropdown.js';
import 'assets/metronic/src/js/framework/components/general/offcanvas.js';
import { ContactInfoPanelComponent } from '@app/shared/common/contact-info-panel/contact-info-panel.component';

let COMPONENTS = [
    HeaderComponent,
    TopBarComponent,
    SideBarComponent,
    UserMenuComponent,
    CreditsTopupDialogComponent,
    ContactInfoPanelComponent
];

@NgModule({
    imports: [
        ngCommon.CommonModule,
        FormsModule,
        RouterModule,
        ModalModule.forRoot(),
        TooltipModule.forRoot(),
        TabsModule.forRoot(),
        PopoverModule.forRoot(),
        UtilsModule,
        FiltersModule,
        LayoutCommonModule,

        DxListModule,
        DxMenuModule,
        DxTooltipModule,
        DxScrollViewModule,
        DxButtonModule,
        DxNavBarModule,
        DxDropDownBoxModule,
        DxNumberBoxModule,
        DxValidatorModule,

        InplaceEditModule,
        UserPhotoModule,
        MatTabsModule,
        MatExpansionModule,
        MatDialogModule,
        PrimeNgFileUploadModule,
        ProgressBarModule,
        TableModule,
        PaginatorModule,
        UserManagementModule,
        AccountSelectorModule
    ],
    declarations: COMPONENTS,
    exports: COMPONENTS,
    providers: [
        LayoutService
    ]
})
export class LayoutModule {}
