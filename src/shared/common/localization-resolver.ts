/** Core imports */
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, CanActivate, CanActivateChild } from '@angular/router';

/** Third party imports */
import { Observable, of, zip } from 'rxjs';
import { tap, take, mergeMap, map } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';

/** Application imports */
import { LocalizationServiceProxy } from '@shared/service-proxies/service-proxies';
import { AppSessionService } from '@shared/common/session/app-session.service';
import { LayoutType } from '@shared/service-proxies/service-proxies';
import { AppConsts } from '@shared/AppConsts';
import { AppLocalizationService } from '@app/shared/common/localization/app-localization.service';

@Injectable()
export class LocalizationResolver implements CanActivate, CanActivateChild {
    DEFAULT_LANGUAGE = 'en';

    constructor(
        private session: AppSessionService,
        private translateService: TranslateService,
        private localizationServiceProxy: LocalizationServiceProxy,
        private ls: AppLocalizationService
    ) {
        this.translateService.setDefaultLang(this.DEFAULT_LANGUAGE);
    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
        return this.canActivateChild(route, state);
    }

    canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
        let defaultLocalization = AppConsts.localization.defaultLocalizationSourceName;
        return zip(
            this.translateService.translations[this.DEFAULT_LANGUAGE] ? 
                of(true) : this.translateService.getTranslation(this.DEFAULT_LANGUAGE),
            this.checkLoadLocalization(route.data.localizationSource || defaultLocalization).pipe(
                tap(() => {
                    if (route.data.localizationSource)
                        this.ls.localizationSourceName = route.data.localizationSource;
                })
            )
        ).pipe(map(results => {
            return results.every(Boolean);
        }));
    }

    checkLoadLocalization(sourceName) {
        let cultureName = abp.localization.currentLanguage.name,
            source: any = abp.localization.sources.find(item => item.name == sourceName);
        if (abp.localization.values[sourceName] && 
                Object.keys(abp.localization.values[sourceName]).length !== 0)
            return of(true);

        abp.localization.values[sourceName] = <any>{};
        return this.localizationServiceProxy.getLocalizationSource(
            Number(this.session.tenantId),
            sourceName,
            source ? source.version : undefined,
            cultureName,
            cultureName
        ).pipe(
            take(1),
            mergeMap(result => {
                if (result)
                    abp.localization.values[result.name] = <any>result.values;
                return of(true);
            })
        );
    }
}