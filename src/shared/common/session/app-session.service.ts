/** Core imports */
import { AbpMultiTenancyService } from 'abp-ng2-module';
import { Injectable } from '@angular/core';

/** Third party imports */
import { Store, select } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map, publishReplay, refCount } from 'rxjs/operators';
import isEqual from 'lodash/isEqual';
import * as _ from 'underscore';

/** Application imports */
import {
    ApplicationInfoDto,
    LayoutType,
    SessionServiceProxy,
    TenantLoginInfoDto,
    UserLoginInfoDto,
    CommonUserInfoServiceProxy,
    CountryDto
} from '@shared/service-proxies/service-proxies';
import { CountriesStoreActions, CountriesStoreSelectors, RootStore } from '@root/store';

export interface ILoginInfo {
    contactId: number | undefined;
    fullName: string | undefined;
    email: string | undefined;
    tenantName: string | undefined;
}

@Injectable()
export class AppSessionService {
    private _user: UserLoginInfoDto;
    private _host: TenantLoginInfoDto;
    private _tenant: TenantLoginInfoDto;
    private _application: ApplicationInfoDto;
    private countries: any;

    userCompany$: Observable<string> = this.commonUserInfoService.getCompany().pipe(
        map(x => isEqual(x, {}) ? null : x),
        publishReplay(), 
        refCount()
    );

    constructor(
        private store$: Store<RootStore.State>,
        private sessionService: SessionServiceProxy,
        private abpMultiTenancyService: AbpMultiTenancyService,
        private commonUserInfoService: CommonUserInfoServiceProxy
    ) {
        this.loadCountries();
        abp.event.on('profilePictureChanged', (thumbnailId) => {
            this.user.profileThumbnailId = thumbnailId;
        });
    }

    get application(): ApplicationInfoDto {
        return this._application;
    }

    get user(): UserLoginInfoDto {
        return this._user;
    }

    get userId(): number {
        return this.user ? this.user.id : null;
    }

    get appearanceConfig(): TenantLoginInfoDto {
        return this._host || this._tenant;
    }

    get tenant(): TenantLoginInfoDto {
        return this._tenant;
    }

    get tenantName(): string {
        return this._tenant ? this.tenant.name : '';
    }

    get tenancyName(): string {
        return this._tenant ? this.tenant.tenancyName : '';
    }

    get tenantId(): number {
        return this.tenant ? this.tenant.id : null;
    }

    get layoutType(): string {
        return this.tenant && this.tenant.customLayoutType ? this.tenant.customLayoutType : LayoutType.Default;
    }

    get hasCustomLogo(): boolean {
        return this.appearanceConfig ? !!this.appearanceConfig.portalLogoId || !!this.appearanceConfig.logoId : false;
    }

    getShownLoginName(): string {
        const userName = this._user.userName;
        if (!this.abpMultiTenancyService.isEnabled) {
            return userName;
        }

        return (this._tenant ? this._tenant.tenancyName : '.') + '\\' + userName;
    }

    getShownLoginInfo(): ILoginInfo {
        let info: ILoginInfo = {
            contactId: this._user && this._user.contactId,
            fullName: this._user && (this._user.name + ' ' + this._user.surname),
            email: this._user && this._user.emailAddress,
            tenantName: undefined
        };

        if (this.abpMultiTenancyService.isEnabled) {
            info.tenantName = this.tenant ? this._tenant.name : 'Host';
        }

        return info;
    }

    getUserNameOrEmail() {
        if (this._user.name == 'Unknown' && this._user.surname == 'Unknown')
            return this._user.emailAddress;

        return this._user.name + ' ' + this._user.surname;
    }

    getTenantLogoUrlParams(): string {
        if (!this.hasCustomLogo)
            return '';

        if (this.appearanceConfig.portalLogoId)
            return `portalLogo=true&logoId=${this.appearanceConfig.portalLogoId}`;
        return `logoId=${this.appearanceConfig.logoId}`;
    }

    init(): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            let updateLoginInfo = (result) => {
                this._application = result.application;
                this._user = result.user;
                this._host = result.host;
                this._tenant = result.tenant;
                resolve(true);
            };

            let generalInfo = window['generalInfo'];
            if (generalInfo && generalInfo.loginInfo)
                updateLoginInfo(generalInfo.loginInfo);
            else
                this.sessionService.getCurrentLoginInformations().subscribe(updateLoginInfo.bind(this), (err) => {
                    reject(err);
                });
        });
    }

    changeTenantIfNeeded(tenantId?: number, reload = true): boolean {
        if (this.isCurrentTenant(tenantId)) {
            return false;
        }

        abp.auth.clearToken();
        abp.multiTenancy.setTenantIdCookie(tenantId);
        reload && location.reload();
        return true;
    }

    getCountryNameByCode(code: string) {
        let country = _.findWhere(this.countries, { code: code });
        return country && country.name;
    }

    private loadCountries(): void {
        this.store$.dispatch(new CountriesStoreActions.LoadRequestAction());
        this.store$.pipe(select(CountriesStoreSelectors.getCountries)).subscribe((countries: CountryDto[]) => {
            this.countries = countries;            
        });
    }

    private isCurrentTenant(tenantId?: number) {
        if (!tenantId && this.tenant) {
            return false;
        } else if (tenantId && (!this.tenant || this.tenant.id !== tenantId)) {
            return false;
        }

        return true;
    }
}