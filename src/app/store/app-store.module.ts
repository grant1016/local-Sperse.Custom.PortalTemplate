/** Core imports */
import { NgModule } from '@angular/core';

/** Application imports */
import { PipelinesStoreModule } from '@app/store/pipelines-store';
import { ListsStoreModule } from '@app/store/lists-store';
import { RatingsStoreModule } from '@app/store/ratings-store';
import { StarsStoreModule } from '@app/store/stars-store';
import { StatusesStoreModule } from '@app/store/statuses-store';
import { TagsStoreModule } from '@app/store/tags-store';

@NgModule({
    imports: [
        PipelinesStoreModule,
        ListsStoreModule,
        RatingsStoreModule,
        StarsStoreModule,
        StatusesStoreModule,
        TagsStoreModule
    ],
    declarations: []
})
export class AppStoreModule {}