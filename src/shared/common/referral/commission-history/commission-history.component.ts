/** Core imports */
import { ChangeDetectionStrategy, ComponentFactoryResolver, ViewChild,
    Directive, Component, ViewContainerRef, OnInit } from '@angular/core';

/** Application imports */
import { CommissionHistoryLayoutBaseComponent } from './commission-history-layout-base.component';
import { CommissionHistoryLayoutLightComponent } from './commission-history-layout-light.component';

@Directive({
    selector: '[ad-commission-history]'
})
export class CommissionHistoryAdDirective {
    constructor(public viewContainerRef: ViewContainerRef) { }
}

@Component({
    selector: 'commission-history',
    templateUrl: 'commission-history.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CommissionHistoryComponent implements OnInit {
    @ViewChild(CommissionHistoryAdDirective, { static: true }) adDirective: CommissionHistoryAdDirective;
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
                this.showBaseLayout ? CommissionHistoryLayoutBaseComponent : CommissionHistoryLayoutLightComponent
            )
        );
    }
}