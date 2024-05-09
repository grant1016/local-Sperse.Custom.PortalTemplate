/** Core imports */
import { Inject, Injectable, Injector } from '@angular/core';
import { DOCUMENT } from '@angular/common';

/** Third party imports */
import { Subject, Observable } from 'rxjs';
import { publishReplay, refCount, map } from 'rxjs/operators';
import * as moment from 'moment';
import * as _ from 'underscore' ;

/** Application imports */
import { MainConfig } from '@app/main/main.config';
import { AppServiceBase } from '@shared/common/app-service-base';
import { PanelMenu } from '@app/shared/layout/top-bar/panel-menu';
import { AppConsts } from '@shared/AppConsts';
import { AppLocalizationService } from '@app/shared/common/localization/app-localization.service';
import {
    InstanceServiceProxy,
    PersonContactServiceProxy,
    RegisterMemberInput,
    InstanceStatus,
    TenantSubscriptionServiceProxy,
    ModuleType,
    ModuleSubscriptionInfoDto
} from '@shared/service-proxies/service-proxies';
import { AppPermissionService } from '@shared/common/auth/permission.service';
import { FeatureCheckerService } from 'abp-ng2-module';
import { NotifyService } from 'abp-ng2-module';
import { AppPermissions } from '@shared/AppPermissions';
import { AppFeatures } from '@shared/AppFeatures';
import { BehaviorSubject } from '@node_modules/rxjs';

@Injectable()
export class AppService extends AppServiceBase {
    public topMenu: PanelMenu;
    public toolbarIsHidden: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    public toolbarIsHidden$: Observable<boolean> = this.toolbarIsHidden.asObservable();
    public narrowingPageContentWhenFixedFilter = true;
    public hideSubscriptionCallback: Function;
    public showContactInfoPanel = false;
    public contactInfo: any;

    private toolbarSubject: Subject<undefined>;
    private expiredModule: Subject<string>;
    public moduleSubscriptions$: Observable<ModuleSubscriptionInfoDto[]>;
    public moduleSubscriptions: ModuleSubscriptionInfoDto[];
    public subscriptionIsFree$: Observable<boolean>;
    private permission: AppPermissionService;
    private feature: FeatureCheckerService;
    private instanceServiceProxy: InstanceServiceProxy;
    private personContactServiceProxy: PersonContactServiceProxy;
    private notify: NotifyService;
    private appLocalizationService: AppLocalizationService;
    private tenantSubscriptionProxy: TenantSubscriptionServiceProxy;
    private subscriptionBarsClosed = {};
    private subscriptionBarVisible: Boolean;
    isCfoLinkOrVerifyEnabled: boolean;
    public defaultSubscriptionModule = ModuleType.CRM;

    constructor(
        injector: Injector,
        @Inject(DOCUMENT) private document: Document,
    ) {
        super(
            injector,
            'Main',
            [
                {
                    name: 'Main',
                    showDescription: true,
                    isComingSoon: false
                },
            ],
            {
                main: new MainConfig()
            }
        );

        this.permission = injector.get(AppPermissionService);
        this.feature = injector.get(FeatureCheckerService);
        this.instanceServiceProxy = injector.get(InstanceServiceProxy);
        this.personContactServiceProxy = injector.get(PersonContactServiceProxy);
        this.notify = injector.get(NotifyService);
        this.appLocalizationService = injector.get(AppLocalizationService);
        this.tenantSubscriptionProxy = injector.get(TenantSubscriptionServiceProxy);
        this.isCfoLinkOrVerifyEnabled = this.feature.isEnabled(AppFeatures.CFOPartner)
            && !this.feature.isEnabled(AppFeatures.PFM)
            && this.permission.isGranted(AppPermissions.CFOMembersAdministration);

        this.toolbarSubject = new Subject<undefined>();
        if (!this.isHostTenant && abp.session.userId) {
            this.expiredModule = new Subject<string>();
            this.loadModuleSubscriptions();
        }
        this.toolbarIsHidden$.subscribe((hidden: boolean) => {
            this.document.body.classList[hidden ? 'add' : 'remove']('toolbar-hidden');
        });
    }

    loadModuleSubscriptions() {
        this.moduleSubscriptions$ = this.tenantSubscriptionProxy.getModuleSubscriptions()
            .pipe(publishReplay(), refCount());
        this.moduleSubscriptions$.subscribe((res) => {
            this.moduleSubscriptions = res.sort((left, right) => {
                return left.endDate > right.endDate ? -1 : 1;
            });
            this.checkModuleExpired();
        });
        this.subscriptionIsFree$ = this.moduleSubscriptions$.pipe(
            map(subscriptions => this.checkSubscriptionIsFree())
        );
    }

    checkGroupIncluded(groups: string[], group: string): Boolean {
        return groups.includes(group.toLowerCase());
    }    

    getModuleSubscription(
        name: string = this.defaultSubscriptionModule, 
        productGroups: string[] = [AppConsts.PRODUCT_GROUP_SIGNUP, AppConsts.PRODUCT_GROUP_MAIN],
        hasCrmFeature: boolean = true
    ): ModuleSubscriptionInfoDto {
        let module = name.toUpperCase(), 
            moduleSubscriptions: ModuleSubscriptionInfoDto[] = this.moduleSubscriptions && productGroups.length ?
                this.moduleSubscriptions.filter(item => item.productGroup && this.checkGroupIncluded(productGroups, item.productGroup)) :
                this.moduleSubscriptions,
            subscription;

        if (hasCrmFeature && moduleSubscriptions)
            moduleSubscriptions = moduleSubscriptions.filter(item => item.hasCrmFeature);

        if (moduleSubscriptions && moduleSubscriptions.length) {
            subscription = _.find(moduleSubscriptions, (subscription: ModuleSubscriptionInfoDto) => {
                return subscription.module.includes(module) && subscription.statusId == 'A';
            });
            if (!subscription)
                subscription = _.find(moduleSubscriptions, (subscription: ModuleSubscriptionInfoDto) => {
                    return subscription.module.includes(module) && subscription.statusId == 'D';
                });
            if (!subscription)
                subscription = _.find(moduleSubscriptions, (subscription: ModuleSubscriptionInfoDto) => {
                    return subscription.module.includes(module) && subscription.statusId == 'C';
                });
        }
        return subscription || { 
            module: module, 
            productName: module, 
            endDate: moment(new Date(0)),
            statusId: 'C'
        };
    }

    getSubscriptionName(module?: string) {
        let sub = this.getModuleSubscription(module);
        return sub && sub.module.replace('_', ' & ') || '';
    }

    getSubscriptionStatusByModuleName(moduleName: string) {
        return this.getSubscriptionStatusBySubscription(this.getModuleSubscription(moduleName));
    }

    getSubscriptionStatusBySubscription(subscription: ModuleSubscriptionInfoDto) {
        return subscription.isTrial
                ? this.appLocalizationService.l('trial')
                : this.appLocalizationService.l('subscription');
    }

    subscriptionIsLocked(name?: string) {
        const subscription = this.getModuleSubscription(name);
        return subscription && subscription.isLocked;
    }

    getSubscriptionTrackingCode(name?: string) {
        const subscription = this.getModuleSubscription(name);
        return subscription && subscription.trackingCode;
    }

    checkModuleSubscriptionEnabled() {
        let module = this.getModule();
        return Boolean(ModuleType[module.toUpperCase()]);
    }

    subscriptionStatusBarIsHidden(): boolean {
        let module = this.getModule();
        if (!ModuleType[module.toUpperCase()])
            return true;

        if (!this.subscriptionBarVisible)
            this.subscriptionBarVisible = !this.showContactInfoPanel &&
                (this.subscriptionIsExpiringSoon() || this.subscriptionInGracePeriod());

        return this.subscriptionBarsClosed[module] || !this.subscriptionBarVisible;
    }

    subscriptionIsExpiringSoon(name?: string): boolean {
        let sub = this.getModuleSubscription(name);
        if (this.hasRecurringBilling(sub))
            return false;

        if (!this.isHostTenant && sub && sub.endDate) {
            let diff = sub.endDate.diff(moment().utc(), 'days', true);
            return (diff > 0) && (diff <= AppConsts.subscriptionExpireNootifyDayCount);
        }
        return false;
    }

    checkSubscriptionIsFree(name?: string): boolean {
        let sub = this.getModuleSubscription(name);
        return sub && !sub.endDate;
    }

    subscriptionInGracePeriod(name?: string): boolean {
        let sub = this.getModuleSubscription(name);
        if (this.hasRecurringBilling(sub))
            return false;

        if (!this.isHostTenant && sub && sub.endDate) {
            let diff = moment().utc().diff(sub.endDate, 'days', true);
            return (diff > 0) && (diff <= this.getGracePeriod(sub));
        }
        return false;
    }

    getGracePeriod(subscription: ModuleSubscriptionInfoDto) {
        return (subscription && subscription.hasRecurringBilling
                  ? AppConsts.subscriptionRecurringBillingPeriod
                  : 0
                ) + AppConsts.subscriptionGracePeriod;
    }

    subscriptionInGracePeriodBySubscription(sub: ModuleSubscriptionInfoDto): boolean {
        if (!this.isHostTenant && sub && !sub.isLocked && sub.endDate) {
            let diff = moment().utc().diff(sub.endDate, 'days', true);
            return (diff > 0) && (diff <= this.getGracePeriod(sub));
        }
        return false;
    }

    getSubscriptionExpiringDayCount(name?: string): number {
        let sub = this.getModuleSubscription(name);
        return sub && sub.endDate && Math.round(moment(sub.endDate)
            .diff(moment().utc(), 'days', true));
    }

    getGracePeriodDayCount(name?: string) {
        let sub = this.getModuleSubscription(name);
        return sub && sub.endDate && Math.round(moment(sub.endDate)
            .add(AppConsts.subscriptionGracePeriod, 'days').diff(moment().utc(), 'days', true));
    }

    getGracePeriodDayCountBySubscription(sub) {
        return sub && !sub.isLocked && sub.endDate && Math.round(moment(sub.endDate)
            .add(this.getGracePeriod(sub), 'days').diff(moment().utc(), 'days', true));
    }

    hasModuleSubscription(name?: string) {
        name = (name || this.getModule()).toUpperCase();
        let module = this.getModuleSubscription(name);
        return this.isHostTenant || !module || !module.endDate ||
            this.hasRecurringBilling(module) || (module.endDate > moment().utc());
    }

    hasRecurringBilling(module: ModuleSubscriptionInfoDto): boolean {
        return module && module.hasRecurringBilling && (moment(module.endDate).add(
            AppConsts.subscriptionRecurringBillingPeriod, 'days') > moment().utc());
    }

    checkModuleExpired(name?: string) {
        name = name || this.getModule();
        let expired = !this.hasModuleSubscription(name);
        if (expired)
            this.expiredModule.next(name);

        return expired;
    }

    switchModule(name: string, params = {}) {
        this.subscriptionBarVisible = undefined;
        if (this.checkModuleExpired(name)
            && !this.subscriptionInGracePeriod(name)
        ) {
            name = this.getDefaultModule();
            params = {};
        }

        super.switchModule(name, params);
    }

    expiredModuleSubscribe(callback) {
        this.expiredModule.asObservable().subscribe(callback);
    }

    setContactInfoVisibility(value: boolean) {
        this.showContactInfoPanel = value;
    }

    canSendVerificationRequest() {
        return this.permission.isGranted(AppPermissions.CFOMembersAdministrationNewMemberRegistration);
    }

    requestVerification(contactId: number): Observable<number> {
        return new Observable<number>((observer) => {
            abp.message.confirm(
                'Please confirm user activation', '',
                (isConfirmed) => {
                    if (isConfirmed) {
                        let request = new RegisterMemberInput();
                        request.contactId = contactId;
                        request.channelCode = 'CRM';
                        this.instanceServiceProxy.registerMember(request).subscribe((result) => {
                            abp.notify.info('User was activated and email sent successfully');
                            observer.next(result.userId);
                        }, () => { }, observer.complete);
                    } else
                        observer.complete();
                }
            );
        });
    }

    redirectToCFO(userId) {
        this.instanceServiceProxy.getUserInstanceInfo(userId).subscribe(result => {
            if (result && result.id && (result.status === InstanceStatus.Active))
                window.open(AppConsts.appBaseUrl + '/app/cfo/' + result.id + '/start');
            else
                this.notify.error(this.appLocalizationService.ls(AppConsts.localization.CRMLocalizationSourceName, 'CFOInstanceInactive'));
        });
    }

    checkCFOClientAccessPermission() {
        return this.permission.isGranted(AppPermissions.CFOMembersAdministrationAllMemberInstancesAdmin);
    }

    toolbarToggle() {
        this.toolbarIsHidden.next(!this.toolbarIsHidden.value);
    }

    toolbarRefresh() {
        this.toolbarSubject.next();
    }

    isFeatureEnable(featureName: AppFeatures): boolean {
        return this.isHostTenant || !featureName || this.feature.isEnabled(featureName);
    }
}