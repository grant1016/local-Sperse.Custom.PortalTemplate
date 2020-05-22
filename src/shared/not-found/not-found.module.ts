/** Core imports */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

/** Application imports */
import { NotFoundComponent } from '@shared/not-found/not-found.component';
import { NotFoundRoutingModule } from '@shared/not-found/not-found-routing.module';
import { LoadingService } from '@shared/common/loading-service/loading.service';
import { AppUrlService } from '@shared/common/nav/app-url.service';

@NgModule({
    imports: [
        CommonModule,
        NotFoundRoutingModule
    ],
    declarations: [
        NotFoundComponent
    ],
    exports: [
        NotFoundComponent
    ],
    providers: [
        AppUrlService,
        LoadingService
    ]
})
export class NotFoundModule {}