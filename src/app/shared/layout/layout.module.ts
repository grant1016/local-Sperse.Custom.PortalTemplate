/** Core imports */
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import * as ngCommon from '@angular/common';
import { FormsModule } from '@angular/forms';

/** Third party modules */
import { MatTabsModule } from '@angular/material/tabs';
import { DxMenuModule } from 'devextreme-angular/ui/menu';
import { DxButtonModule } from 'devextreme-angular/ui/button';
import { DxDropDownBoxModule } from 'devextreme-angular/ui/drop-down-box';
import { DxListModule } from 'devextreme-angular/ui/list';
import { DxScrollViewModule } from 'devextreme-angular/ui/scroll-view';
import { DxNavBarModule } from 'devextreme-angular/ui/nav-bar';
import { ModalModule, TabsModule, TooltipModule, PopoverModule } from 'ngx-bootstrap';
import { FileUploadModule as PrimeNgFileUploadModule } from 'primeng/fileupload';
import { TableModule } from 'primeng/table';
import { ProgressBarModule } from 'primeng/progressbar';
import { PaginatorModule } from 'primeng/paginator';

/** Application imports */
import { LayoutCommonModule } from './layout-common.module';
import { HeaderComponent } from './header/header.component';
import { TopBarComponent } from './top-bar/top-bar.component';
import { UtilsModule } from '@shared/utils/utils.module';
import { LayoutService } from '@app/shared/layout/layout.service';
import { UserManagementModule } from '@shared/common/layout/user-management-list/user-management.module';

/** @todo Used for chart bar and dropdown. Reimplement in future */
import 'assets/metronic/src/js/framework/base/util.js';
import 'assets/metronic/src/js/framework/base/app.js';
import 'assets/metronic/src/js/framework/components/general/dropdown.js';
import 'assets/metronic/src/js/framework/components/general/offcanvas.js';
import { ContactInfoPanelComponent } from '@app/shared/common/contact-info-panel/contact-info-panel.component';

let COMPONENTS = [
    HeaderComponent,
    TopBarComponent,
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
        LayoutCommonModule,

        DxListModule,
        DxMenuModule,
        DxScrollViewModule,
        DxButtonModule,
        DxNavBarModule,
        DxDropDownBoxModule,

        MatTabsModule,

        PrimeNgFileUploadModule,
        ProgressBarModule,
        TableModule,
        PaginatorModule,
        UserManagementModule
    ],
    declarations: COMPONENTS,
    exports: COMPONENTS,
    providers: [
        LayoutService
    ]
})
export class LayoutModule {}
