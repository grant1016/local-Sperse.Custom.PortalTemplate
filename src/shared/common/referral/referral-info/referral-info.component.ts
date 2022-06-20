/** Core imports */
import { ChangeDetectionStrategy, ComponentFactoryResolver, ViewChild,
    Directive, Component, ViewContainerRef, OnInit } from '@angular/core';

/** Application imports */
import { ReferralInfoLayoutBaseComponent } from './referral-info-layout-base.component';
import { ReferralInfoLayoutLightComponent } from './referral-info-layout-light.component';

@Directive({
    selector: '[ad-referral-info]'
})
export class ReferralInfoAdDirective {
    constructor(public viewContainerRef: ViewContainerRef) { }
}

@Component({
    selector: 'referral-info',
    templateUrl: 'referral-info.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReferralInfoComponent implements OnInit {
    @ViewChild(ReferralInfoAdDirective, { static: true }) adDirective: ReferralInfoAdDirective;
    showBaseLayout = false;

    constructor(
        private componentFactoryResolver: ComponentFactoryResolver
    ) {}

    ngOnInit(): void {
        this.loadLayoutComponent();
    }

    private loadLayoutComponent() {
        this.adDirective.viewContainerRef.createComponent(
            this.componentFactoryResolver.resolveComponentFactory(
                this.showBaseLayout ? ReferralInfoLayoutBaseComponent : ReferralInfoLayoutLightComponent
            )
        );
    }
}