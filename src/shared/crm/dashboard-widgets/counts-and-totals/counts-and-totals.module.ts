import { NgModule } from '@angular/core';

import { CountsAndTotalsComponent } from './counts-and-totals.component';
import { CommonModule } from '@angular/common';

@NgModule({
    imports: [
        CommonModule
    ],
    exports: [ CountsAndTotalsComponent ],
    declarations: [ CountsAndTotalsComponent ],
    providers: [],
})
export class CountsAndTotalsModule {
}
