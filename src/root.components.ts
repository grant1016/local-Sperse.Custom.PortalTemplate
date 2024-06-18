/** Core imports */
import { AfterViewInit, Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { DOCUMENT } from '@angular/common';

/** Third party imports */
import kebabCase from 'lodash/kebabCase';
import * as _ from 'underscore';

/** Core imports */
import { AppConsts } from '@shared/AppConsts';
import { AppSessionService } from '@shared/common/session/app-session.service';
import { AppUiCustomizationService } from '@shared/common/ui/app-ui-customization.service';
import { LayoutType, CustomCssType } from '@shared/service-proxies/service-proxies';
import { LoadingService } from '@shared/common/loading-service/loading.service';
import { DomHelper } from '@shared/helpers/DomHelper';

/*
    Root App Component (App Selector)
*/
@Component({
    selector: 'app-root',
    template: '<router-outlet></router-outlet>',
    styleUrls: ['./root.component.less'],
    encapsulation: ViewEncapsulation.None
})
export class RootComponent implements OnInit, AfterViewInit {
    constructor(
        public loadingService: LoadingService,
        private router: Router,
        private uiCustomizationService: AppUiCustomizationService,
        @Inject(AppSessionService) private SS,
        @Inject(DOCUMENT) private document
    ) {
        this.pageHeaderFixed(true);
        let subscription = router.events.subscribe((event) => {
            if (event instanceof NavigationEnd) {
                this.document.body.querySelectorAll('div.initial').forEach(elm => {
                    setTimeout(() => this.document.body.removeChild(elm), 1000);
                });
                subscription.unsubscribe();
            }
        });
    }

    ngOnInit() {
        if (abp && abp.setting && abp.setting.values && abp.setting.values['Integrations:Google:MapsJavascriptApiKey'] && this.SS.userId)
            DomHelper.addScriptLink(AppConsts.googleMapsApiUrl.replace('{KEY}', abp.setting.values['Integrations:Google:MapsJavascriptApiKey']));

        //tenant specific custom css
        let tenant = this.SS.tenant;
        if (tenant) {
            let customCss = abp.session.userId ? tenant.portalCustomCssId : tenant.loginCustomCssId;
            if (customCss)
                DomHelper.addStyleSheet(`${CustomCssType.Portal}CustomCss`, AppConsts.remoteServiceBaseUrl + 
                    '/api/TenantCustomization/GetCustomCss/' + customCss + '/' + tenant.id);

            if (tenant.customLayoutType && tenant.customLayoutType !== LayoutType.Default) {
                let layoutName = kebabCase(tenant.customLayoutType);
                this.document.body.classList.add(layoutName);
                DomHelper.addStyleSheet(tenant.customLayoutType + 'Styles', AppConsts.appBaseHref +
                    'assets/common/styles/custom/' + layoutName + '/style.css');
            }

            this.checkSetGoogleAnalyticsCode(tenant);
        }
    }

    ngAfterViewInit() {
        this.checkSetClasses(abp.session.userId);
    }

    public checkSetClasses(loggedUser) {
        let classList = this.document.body.classList,
            loggedClass = this.uiCustomizationService.getAppModuleBodyClass().split(' ').filter(Boolean),
            accountClass = this.uiCustomizationService.getAccountModuleBodyClass().split(' ').filter(Boolean);
        classList.remove.apply(classList, accountClass.concat(accountClass));
        classList.add.apply(classList, loggedUser ? loggedClass : accountClass);
    }

    public pageHeaderFixed(value?: boolean) {
        this.document.body.classList[
            value ? 'add' : 'remove']('page-header-fixed');
    }

    public overflowHidden(value?: boolean) {
        this.document.body.classList[
            value ? 'add' : 'remove']('overflow-hidden');
    }

    checkSetGoogleAnalyticsCode(tenant) {
        let tenantGACode = '';
        if (tenantGACode) {
            DomHelper.addScriptLink('https://www.googletagmanager.com/gtag/js?id=' + tenantGACode, '', () => {
                let dataLayer = window['dataLayer'] = window['dataLayer'] || [];
                dataLayer.push(['js', new Date()]);
                dataLayer.push(['config', tenantGACode]);
            });
        }
    }
}