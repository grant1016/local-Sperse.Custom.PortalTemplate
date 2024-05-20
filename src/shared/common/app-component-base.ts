/** Core imports */
import { Injector, ApplicationRef, ElementRef, HostBinding, OnDestroy, Directive } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

/** Third party imports */
import { Subject, Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import capitalize from 'underscore.string/capitalize';

/** Application imports */
import { DateHelper } from '@shared/helpers/DateHelper';
import { AppPermissionService } from '@shared/common/auth/permission.service';
import { LocalizationService } from 'abp-ng2-module';
import { FeatureCheckerService } from 'abp-ng2-module';
import { NotifyService } from 'abp-ng2-module';
import { SettingService } from 'abp-ng2-module';
import { MessageService } from 'abp-ng2-module';
import { AbpMultiTenancyService } from 'abp-ng2-module';
import { AppLocalizationService } from '@app/shared/common/localization/app-localization.service';
import { AppSessionService } from '@shared/common/session/app-session.service';
import { PrimengTableHelper } from 'shared/helpers/PrimengTableHelper';
import { AppUiCustomizationService } from '@shared/common/ui/app-ui-customization.service';
import { AppUrlService } from '@shared/common/nav/app-url.service';
import { AppHttpInterceptor } from '@shared/http/appHttpInterceptor';
import { LoadingService } from '@shared/common/loading-service/loading.service';
import { AppPermissions } from '@shared/AppPermissions';
import { FullScreenService } from '@shared/common/fullscreen/fullscreen.service';
import { TitleService } from '@shared/common/title/title.service';
import { ProfileService } from '@shared/common/profile-service/profile.service';

@Directive()
export abstract class AppComponentBase implements OnDestroy {
    @HostBinding('class.fullscreen') public isFullscreenMode;
    private destroySubject: Subject<boolean> = new Subject<boolean>();
    destroy$: Observable<boolean> = this.destroySubject.asObservable();
    private deactivateSubject: Subject<boolean> = new Subject<boolean>();
    deactivate$: Observable<boolean> = this.deactivateSubject.asObservable();
    dataGrid: any;
    dataSource: any;
    isDataLoaded = false;
    totalRowCount: number;
    totalDataSource: any;
    localization: LocalizationService;
    permission: AppPermissionService;
    protected feature: FeatureCheckerService;
    notify: NotifyService;
    setting: SettingService;
    message: MessageService;
    multiTenancy: AbpMultiTenancyService;
    appSession: AppSessionService;
    httpInterceptor: AppHttpInterceptor;
    primengTableHelper: PrimengTableHelper;
    ui: AppUiCustomizationService;
    profileService: ProfileService;
    fullScreenService: FullScreenService;
    loading: boolean;
    appUrlService: AppUrlService;
    localizationService: AppLocalizationService;
    titleService: TitleService;
    protected _activatedRoute: ActivatedRoute;
    protected _router: Router;
    get componentIsActivated(): boolean {
        return this._activatedRoute['_routerState'].snapshot.url === this._router.url;
    }

    public searchClear = true;
    public searchValue: string;
    public searchColumns: any[];

    private _prevScrollPos: any;
    private _elementRef: ElementRef;
    private _applicationRef: ApplicationRef;

    public capitalize = capitalize;
    public userTimezone = '0000';
    public loadingService: LoadingService;

    constructor(
        private _injector: Injector
    ) {
        this.localization = _injector.get(LocalizationService);
        this.permission = _injector.get(AppPermissionService);
        this.feature = _injector.get(FeatureCheckerService);
        this.notify = _injector.get(NotifyService);
        this.setting = _injector.get(SettingService);
        this.message = _injector.get(MessageService);
        this.multiTenancy = _injector.get(AbpMultiTenancyService);
        this.appSession = _injector.get(AppSessionService);
        this.ui = _injector.get(AppUiCustomizationService);
        this.httpInterceptor = _injector.get(AppHttpInterceptor);
        this._applicationRef = _injector.get(ApplicationRef);
        this.primengTableHelper = new PrimengTableHelper();
        this.appUrlService = _injector.get(AppUrlService);
        this.localizationService = _injector.get(AppLocalizationService);
        this.profileService = _injector.get(ProfileService);
        this.loadingService = _injector.get(LoadingService);
        this._activatedRoute = _injector.get(ActivatedRoute);
        this._router = _injector.get(Router);
        this.userTimezone = DateHelper.getUserTimezone();
        this.fullScreenService = _injector.get(FullScreenService);
        this.titleService = _injector.get(TitleService);
        this.fullScreenService.isFullScreenMode$
            .pipe(takeUntil(this.destroy$))
            .subscribe((isFullScreenMode: boolean) => {
                this.isFullscreenMode = isFullScreenMode;
            });
    }

    getRootComponent() {
        return this._injector.get(this._applicationRef.componentTypes[0]);
    }

    getElementRef() {
        if (!this._elementRef)
            this._elementRef = this._injector.get(ElementRef);
        return this._elementRef;
    }

    l(key: string, ...args: any[]): string {
        return this.localizationService.l(key, ...args);
    }

    ls(sourcename: string, key: string, ...args: any[]): string {
        return this.localizationService.ls(sourcename, key, ...args);
    }

    isGranted(permissionName: AppPermissions): boolean {
        return this.permission.isGranted(permissionName);
    }

    s(key: string): string {
        return abp.setting.get(key);
    }

    startLoading(globally = false, element: any = null) {
        this.loading = true;
        this.loadingService.startLoading(globally ? null : element || this.getElementRef().nativeElement);
    }

    finishLoading(globally = false, element: any = null) {
        this.loadingService.finishLoading(globally ? null : element || this.getElementRef().nativeElement);
        this.loading = false;
    }

    showHostElement(callback?) {
        setTimeout(() => {
            this.getElementRef().nativeElement.style.display = 'block';
            this.dataGrid && this.dataGrid.instance && this.dataGrid.instance.repaint();
            callback && callback();
        }, 100);
    }

    hideHostElement() {
        this.getElementRef().nativeElement
            .style.display = 'none';
    }

    invalidate() {
        if (this.dataGrid && this.dataGrid.instance) {
            this.isDataLoaded = false;
            this.dataGrid.instance.refresh();
        }
    }

    protected setTitle(moduleName: string) {
        this.titleService.setTitle(moduleName);
    }

    setGridDataLoaded() {
        let gridInstance = this.dataGrid && this.dataGrid.instance;
        if (gridInstance) {
            let dataSource = gridInstance.getDataSource();
            if (dataSource) {
                this.isDataLoaded = dataSource.isLoaded();
                this.totalRowCount = dataSource.totalCount();
            }
        }
    }

    onGridOptionChanged(event) {
        if (event.component.option('scrolling.mode') != 'infinite' &&
            (event.name == 'paging' || ['asc', 'desc'].indexOf(event.value) >= 0)
        )
            this.isDataLoaded = false;
    }

    getQuickSearchParam() {
        return this.searchValue ? { name: 'quickSearchString', value: this.searchValue } : null;
    }

    activate() {
        if (this.searchValue && this.searchClear) {
            this.searchValue = '';
            this.invalidate();
        } if (this.dataGrid && this.dataGrid.instance) {
            let scroll = this.dataGrid.instance.getScrollable();
            if (scroll) {
                setTimeout(() => {
                    scroll.update();
                    if (this._prevScrollPos)
                        scroll.scrollTo(this._prevScrollPos);
                }, 200);
            }
        }
        this.searchClear = true;
    }

    deactivate() {
        this.deactivateSubject.next(true);
        if (this.dataGrid && this.dataGrid.instance) {
            let scroll = this.dataGrid.instance.getScrollable();
            if (scroll)
                this._prevScrollPos = scroll.scrollOffset();
            this.dataGrid.instance.hideColumnChooser();
        }
    }

    ngOnDestroy() {
        this.destroySubject.next(true);
        this.destroySubject.unsubscribe();
    }
}
