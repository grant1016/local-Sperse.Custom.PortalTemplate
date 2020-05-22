import { Component, ViewEncapsulation } from '@angular/core';

@Component({
    selector: 'signup',
    templateUrl: './signup.component.html',
    styleUrls: [
        './signup.component.less',
        '../../../node_modules/devextreme/dist/css/dx.common.css',
        '../../../node_modules/devextreme/dist/css/dx.light.css'
    ],
    encapsulation: ViewEncapsulation.None
})
export class SignupComponent { }
