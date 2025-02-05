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
import { LayoutType, CustomCssType, TenantLoginInfoDto } from '@shared/service-proxies/service-proxies';
import { LoadingService } from '@shared/common/loading-service/loading.service';
import { FontService } from '@shared/common/font-service/font.service';
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
        private fontService: FontService,
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
        if (abp && abp.setting && abp.setting.values) {
            let mapKey = abp.setting.values['Integrations:Google:MapsJavascriptApiKey'];
            if (mapKey && this.SS.userId)
                DomHelper.addScriptLink(AppConsts.googleMapsApiUrl.replace('{KEY}', mapKey));
            

            let fontName = abp.setting.values['App.Appearance.Portal.FontName'] || AppConsts.defaultFontName,
            tabularFontName = abp.setting.values['App.Appearance.Portal.TabularFont'] || AppConsts.defaultTabularFontName,
            buttonColor = abp.setting.values['App.Appearance.Portal.ButtonColor'] || AppConsts.defaultButtonColor,
            buttonTextColor = abp.setting.values['App.Appearance.Portal.ButtonTextColor'] || AppConsts.defaultButtonTextColor,
            buttonHighlightedColor = abp.setting.values['App.Appearance.Portal.ButtonHighlightedColor'] || AppConsts.defaultButtonHighlightedColor,
            leftSideMenuColor = abp.setting.values['App.Appearance.Portal.LeftsideMenuColor'] || AppConsts.defaultLeftSideMenuColor,
            borderRadius = abp.setting.values['App.Appearance.Portal.BorderRadius'] || AppConsts.defaultBorderRadius,
            rootStyle = this.document.querySelector(':root').style;

            if (this.fontService.supportedCustomFonts.includes(fontName))
                DomHelper.addStyleSheet('custom-font', './assets/fonts/fonts-' + fontName.toLowerCase() + '.css');            
            else
                DomHelper.addStyleSheet('googleapis', 'https://fonts.googleapis.com/css?family=' + fontName);

            rootStyle.setProperty('--app-font-family', fontName);
            rootStyle.setProperty('--app-tabular-font-family', tabularFontName);
            rootStyle.setProperty('--app-left-bar-color', leftSideMenuColor);
            rootStyle.setProperty('--app-button-color', buttonColor);
            rootStyle.setProperty('--app-button-text-color', buttonTextColor);
            rootStyle.setProperty('--app-button-highlighted-color', buttonHighlightedColor);
            rootStyle.setProperty('--app-border-radius', borderRadius + 'px');
            rootStyle.setProperty('--app-button-context-color', abp.setting.values['App.Appearance.Portal.ButtonColor'] || '#00a0dc');
        }

        //tenant specific custom css
        let config: TenantLoginInfoDto = this.SS.appearanceConfig;
        if (config) {
            let customCss = abp.session.userId ? config.portalCustomCssId : config.portalLoginCustomCssId;
            if (customCss)
                DomHelper.addStyleSheet(`${CustomCssType.Portal}CustomCss`, AppConsts.remoteServiceBaseUrl + 
                    '/api/TenantCustomization/GetCustomCss/' + customCss + '/' + (config.id || ''));

            if (config.customLayoutType && config.customLayoutType !== LayoutType.Default) {
                let layoutName = kebabCase(config.customLayoutType);
                this.document.body.classList.add(layoutName);
                DomHelper.addStyleSheet(config.customLayoutType + 'Styles', AppConsts.appBaseHref +
                    'assets/common/styles/custom/' + layoutName + '/style.css');
            }

            this.checkSetGoogleAnalyticsCode(config);
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