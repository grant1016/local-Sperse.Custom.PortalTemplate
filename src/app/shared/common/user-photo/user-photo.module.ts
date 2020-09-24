import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserPhotoComponent } from './user-photo.component';

@NgModule({
    imports: [
        CommonModule
    ],
    exports: [ UserPhotoComponent ],
    declarations: [ UserPhotoComponent ],
    providers: [],
})
export class UserPhotoModule {}