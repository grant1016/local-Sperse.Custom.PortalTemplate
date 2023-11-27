/** Core imports */
import { ChangeDetectionStrategy, ComponentFactoryResolver, ViewChild,
    Directive, Component, ViewContainerRef, OnInit, Inject } from '@angular/core';

/** Application imports */
import { AppLocalizationService } from '@app/shared/common/localization/app-localization.service';
import { AppPermissionService } from '@shared/common/auth/permission.service';
import { ReferralLayoutBaseComponent } from './referral-layout-base.component';
import { ReferralLayoutLightComponent } from './referral-layout-light.component';
import { AppPermissions } from '@shared/AppPermissions'
import { AppFeatures } from '@shared/AppFeatures'

@Directive({
    selector: '[ad-referral]'
})
export class ReferralAdDirective {
    constructor(public viewContainerRef: ViewContainerRef) { }
}

@Component({
    selector: 'referral',
    templateUrl: 'referral.component.html',
    styleUrls: [
        'referral.component.less'
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReferralComponent implements OnInit {
    @ViewChild(ReferralAdDirective, { static: true }) adDirective: ReferralAdDirective;
    componentRef: any;

    constructor(
        private componentFactoryResolver: ComponentFactoryResolver,
        public permission: AppPermissionService,
        @Inject('layout') private layout: string,
        public ls: AppLocalizationService
    ) {}

    ngOnInit(): void {
        this.loadLayoutComponent();
    }

    private loadLayoutComponent() {
        this.componentRef = this.adDirective.viewContainerRef.createComponent(
            this.componentFactoryResolver.resolveComponentFactory(
                this.layout ? ReferralLayoutLightComponent : ReferralLayoutBaseComponent
            )
        ).instance;
    }

    activate() {
        if (this.componentRef && this.componentRef.activate)
            this.componentRef.activate();
    }

    deactivate() {
        if (this.componentRef && this.componentRef.deactivate)
            this.componentRef.deactivate();
    }
}