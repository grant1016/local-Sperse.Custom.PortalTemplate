/** Core imports */
import { ChangeDetectionStrategy, ComponentFactoryResolver, ViewChild,
    Directive, Component, ViewContainerRef, OnInit } from '@angular/core';

/** Application imports */
import { ReferralLayoutBaseComponent } from './referral-layout-base.component';
import { ReferralLayoutLightComponent } from './referral-layout-light.component';

@Directive({
    selector: '[ad-referral]'
})
export class ReferralAdDirective {
    constructor(public viewContainerRef: ViewContainerRef) { }
}

@Component({
    selector: 'referral',
    templateUrl: 'referral.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReferralComponent implements OnInit {
    @ViewChild(ReferralAdDirective, { static: true }) adDirective: ReferralAdDirective;
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
                this.showBaseLayout ? ReferralLayoutBaseComponent : ReferralLayoutLightComponent
            )
        );
    }
}