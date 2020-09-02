/** Core imports */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

/** Third party imports */
import { MatDialogModule } from '@angular/material/dialog';
import { DxTreeListModule } from 'devextreme-angular/ui/tree-list';
import { DxTooltipModule } from 'devextreme-angular/ui/tooltip';
import { DxListModule } from 'devextreme-angular/ui/list';
import { DxCheckBoxModule } from 'devextreme-angular/ui/check-box';
import { DxRadioGroupModule } from 'devextreme-angular/ui/radio-group';

/** Application imports */
import { TagsListComponent } from './tags-list/tags-list.component';
import { ListsListComponent } from './lists-list/lists-list.component';
import { RatingComponent } from './rating/rating.component';
import { AppRatingModule } from '../rating/app-rating.module';
import { DeleteAndReassignDialogComponent } from './delete-and-reassign-dialog/delete-and-reassign-dialog.component';

@NgModule({
    imports: [
        CommonModule,
        MatDialogModule,
        DxCheckBoxModule,
        DxTreeListModule,
        DxTooltipModule,
        DxListModule,
        DxRadioGroupModule,
        AppRatingModule
    ],
    exports: [
        TagsListComponent,
        ListsListComponent,
        RatingComponent,
        DeleteAndReassignDialogComponent
    ],
    declarations: [
        TagsListComponent,
        RatingComponent,
        ListsListComponent,
        DeleteAndReassignDialogComponent
    ],
    entryComponents: [
        DeleteAndReassignDialogComponent
    ]
})
export class ListsModule {}