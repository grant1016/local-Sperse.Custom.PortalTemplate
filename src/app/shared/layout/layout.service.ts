import { Injectable } from '@angular/core';
import { AppSessionService } from '@shared/common/session/app-session.service';
import { LayoutType } from '@shared/service-proxies/service-proxies';
import { AppFeatures } from '@root/shared/AppFeatures';
import { AppConsts } from '@shared/AppConsts';

@Injectable()
export class LayoutService {
    public showPageLogo = true;
    public showTopNavBar = false;
    public showPlatformSelectMenu = true;
    public showNotificationsButton = true;
    public showChatButton = true;
    public showUserProfileMenu = true;

    defaultHeaderBgColor: string = AppConsts.defaultHeaderBgColor;
    defaultHeaderTextColor: string = AppConsts.defaultHeaderTextColor;
    defaultHeaderUnderlineColor: string = AppConsts.defaultHeaderUnderlineColor;
    defaultButtonColor: string = AppConsts.defaultButtonColor;
    defaultButtonTextColor: string = AppConsts.defaultButtonTextColor;
    defaultButtonHighlightedColor: string = AppConsts.defaultButtonHighlightedColor;
    defaultLeftSideMenuColor: string = AppConsts.defaultLeftSideMenuColor;
    defaultFontName: string = AppConsts.defaultFontName;
    defaultTabularFontName: string = AppConsts.defaultTabularFontName;
    defaultBorderRadius: string = AppConsts.defaultBorderRadius;

    layoutColors = {
        [LayoutType.Default]: {
            historicalCredit: '#00aeef',
            historicalDebit: '#f05b2a',
            historicalNetChange: '#fab800',
            endingBalance: '#F9E784',
            forecastCredit: '#a9e3f9',
            forecastDebit: '#fec6b3',
            forecastNetChange: '#a82aba',
            forecastEndingBalance: '#f9c4e4',
            green: '#8bd553',
            blue: '#00AEEF',
            orange: '#F9B74B',
            purple: '#8487e7',
            totalSales: '#8487e7',
            totalLeads: '#00AEEF',
            totalClients: '#f4ae55',
            clientsCount: '#8487e7',
            navBackground: this.getNavBarColor('NavBackground', this.defaultHeaderBgColor),
            navTextColor: this.getNavBarColor('NavTextColor', this.defaultHeaderTextColor),
            navUnderlineColor: this.getNavBarColor('NavTextColor', this.defaultHeaderUnderlineColor)
        }
    };
    mapPalette = {
        [LayoutType.Default]: [ '#c1b9ff', '#b6abff', '#aa9eff', '#9e91ff', '#9383ff', '#8776ff', '#7b69ff', '#705bff' ]
    };

    constructor(private appSessionService: AppSessionService) {}

    displayDefaultPageHeader(value: boolean = false) {
        this.showPageLogo = this.showPlatformSelectMenu = this.showNotificationsButton = this.showChatButton = this.showUserProfileMenu = value;
    }

    getLayoutColor(colorFor: string): string {
        const layoutType = this.appSessionService.layoutType;
        return this.layoutColors[layoutType]
            ? this.layoutColors[layoutType][colorFor]
            : this.layoutColors[LayoutType.Default][colorFor];
    }

    getMapPalette(): string[] {
        return this.mapPalette[this.appSessionService.layoutType] || this.mapPalette[LayoutType.Default];
    }

    getNavBarColor(property: string, defaultColor: string) {
        if (abp.features.isEnabled(AppFeatures.AdminCustomizations))
            return abp.setting.get('App.Appearance.Portal.' + property) || defaultColor;
        else
            return defaultColor; 
    }
}