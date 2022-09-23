import { Component, Injector } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AppAuthService } from '@shared/common/auth/app-auth.service';

@Component({
    templateUrl: './access-denied.component.html',
    styleUrls: ['./access-denied.component.less']
})
export class AccessDeniedComponent extends AppComponentBase {
    constructor(
        private injector: Injector,
        private authService: AppAuthService
    ) {
        super(injector);
    }

    logout() {
        this.authService.logout(true);
    }

    reload() {
        location.href = location.origin;
    }
}