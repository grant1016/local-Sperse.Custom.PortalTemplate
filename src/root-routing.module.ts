import { NgModule, ApplicationRef, Injector, Injectable, AfterViewInit, Directive } from '@angular/core';
import { RouterModule, Route, Router, Routes, NavigationEnd, PreloadingStrategy } from '@angular/router';
import { Observable, of } from 'rxjs';
import { RouteGuard } from '@shared/common/auth/route-guard';
import { LocalizationResolver } from '@shared/common/localization-resolver';
import { AccessDeniedComponent } from '@app/main/access-denied/access-denied.component';                    
import { AppFeatures } from '@shared/AppFeatures';

@Injectable()
export class AppPreloadingStrategy implements PreloadingStrategy {
    preload(route: Route, load: Function): Observable<any> {
        //return abp.session.userId && (!route.data || !route.data.feature || abp.features.isEnabled(route.data.feature)) ? load() : of(null);
        return of(null);
    }
}

const routes: Routes = [
    {
        path: '',
        canActivate: [ RouteGuard, LocalizationResolver ],
        canActivateChild: [ RouteGuard ],
        children: [
            {
                path: '',
                redirectTo: 'app',
                pathMatch: 'full'
            },
            { path: 'access-denied', component: AccessDeniedComponent },
            {
                path: 'account',
                loadChildren: () => import('account/account.module').then(m => m.AccountModule), //Lazy load account module
            },
            {
                path: 'app',
                loadChildren: () => import('app/app.module').then(m => m.AppModule), //Lazy load desktop module
                data: { feature: AppFeatures.Portal, localizationSource: 'Platform' }
            },
            {
                path: 'public',
                loadChildren: () => import('public/public.module').then(m => m.PublicModule),
            }
        ]
    },
    {
        path: '**',
        canActivateChild: [ LocalizationResolver ],
        loadChildren: () => import('shared/not-found/not-found.module').then(m => m.NotFoundModule),
    }
];

@NgModule({
    imports: [
        RouterModule.forRoot(routes, {
            preloadingStrategy: AppPreloadingStrategy
        })
    ],
    exports: [
        RouterModule
    ],
    providers: [LocalizationResolver]
})
export class RootRoutingModule implements AfterViewInit {
    constructor(
        private injector: Injector,
        private router: Router,
        private applicationRef: ApplicationRef
    ) {}

    ngAfterViewInit() {
        /*this.router.events.subscribe((event: NavigationEnd) => {
                setTimeout(() => {
                    this.injector.get(this.applicationRef.componentTypes[0])
                        .checkSetClasses(abp.session.userId || (event.url.indexOf('/account/') >= 0));
                }, 0);
            }
        );*/
    }
}