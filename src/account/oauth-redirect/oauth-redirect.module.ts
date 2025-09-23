/** Core imports */
import { NgModule } from '@angular/core';

/** Third party imports */

/** Application imports */
import { OAuthRedirectComponent } from './oauth-redirect.component';
import { OAuthPopupService } from './oauth-redirect.service';
import {
    ExternalUserDataServiceProxy
} from '@root/shared/service-proxies/service-proxies';

@NgModule({
    imports: [],
    exports: [],
    declarations: [
        OAuthRedirectComponent
    ],
    providers: [
        ExternalUserDataServiceProxy,
        OAuthPopupService
    ]
})
export class OAuthRedirectModule { }