/** Core imports */
import { ChangeDetectionStrategy, ComponentFactoryResolver, ViewChild,
    Directive, Component, ViewContainerRef, OnInit, Inject } from '@angular/core';

/** Application imports */
import { CommissionAmountsLayoutBaseComponent } from './commission-amounts-layout-base.component';
import { CommissionAmountsLayoutLightComponent } from './commission-amounts-layout-light.component';

@Directive({
    selector: '[ad-commission-amounts]'
})
export class CommissionAmountsAdDirective {
    constructor(public viewContainerRef: ViewContainerRef) { }
}

@Component({
    selector: 'commission-amounts',
    templateUrl: 'commission-amounts.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CommissionAmountsComponent implements OnInit {
    @ViewChild(CommissionAmountsAdDirective, { static: true }) adDirective: CommissionAmountsAdDirective;

    constructor(
        private componentFactoryResolver: ComponentFactoryResolver,
        @Inject('layout') private layout: string
    ) {}

    ngOnInit(): void {
        this.loadLayoutComponent();
    }

    private loadLayoutComponent() {
        this.adDirective.viewContainerRef.createComponent(
            this.componentFactoryResolver.resolveComponentFactory(
                this.layout ? CommissionAmountsLayoutLightComponent : CommissionAmountsLayoutBaseComponent
            )
        );
    }
}