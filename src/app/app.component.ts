/** Core imports */
import { Component, OnInit, Injector, OnDestroy, 
    Renderer2, Inject, ViewEncapsulation } from '@angular/core';
import { NavigationEnd } from '@angular/router';
import { DOCUMENT } from '@angular/common';

/** Third party imports */
import { filter, takeUntil } from 'rxjs/operators';

/** Application imports */
import { AppComponentBase } from '@shared/common/app-component-base';
import { FiltersService } from '@shared/filters/filters.service';
import { AppService } from './app.service';

@Component({
    templateUrl: './app.component.html',
    styleUrls: [
        '../shared/common/styles/core.less',
        '../account/account-dialog.less',
        './app.component.less'
    ],
    encapsulation: ViewEncapsulation.None
})
export class AppComponent extends AppComponentBase implements OnInit, OnDestroy {
    private rootComponent: any;
    public constructor(
        injector: Injector,
        private appService: AppService,
        private renderer: Renderer2,
        public filtersService: FiltersService,
        @Inject(DOCUMENT) private document: any
    ) {
        super(injector);
        this.rootComponent = this.getRootComponent();
        this.titleService.setTitle('');
    }

    closeUserMenuPopup(event) {
        let menu = document.querySelector('user-dropdown-menu li');
        if (menu && menu.classList.contains('m-dropdown--open'))
            menu.classList.remove('m-dropdown--open');
    }

    ngOnInit(): void {
        this.appService.initModule();
        this._router.events.pipe(
            takeUntil(this.destroy$),
            filter(event => event instanceof NavigationEnd)
        ).subscribe(() => {
            scrollTo(0, 0);
        });
    }

    ngOnDestroy() {
        super.ngOnDestroy();
    }
}