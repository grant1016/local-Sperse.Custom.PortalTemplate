/** Core imports */
import {
    ChangeDetectionStrategy,
    Component,
    OnInit,
    OnDestroy,
    ElementRef,
    ChangeDetectorRef,
    Input,
    SimpleChanges,
    OnChanges
} from '@angular/core';

/** Third party imports */
import { takeUntil } from 'rxjs/operators';

/** Application imports */
import { AppConsts } from '@shared/AppConsts';
import { DashboardServiceProxy } from 'shared/service-proxies/service-proxies';
import { DashboardWidgetsService } from '../dashboard-widgets.service';
import { AppLocalizationService } from '@app/shared/common/localization/app-localization.service';
import { GetTotalsOutput } from '@shared/service-proxies/service-proxies';
import { LifecycleSubjectsService } from '@shared/common/lifecycle-subjects/lifecycle-subjects.service';
import { LoadingService } from '@shared/common/loading-service/loading.service';
import { TotalsDataField } from '@shared/crm/dashboard-widgets/counts-and-totals/totals-data-field.interface';

@Component({
    selector: 'counts-and-totals',
    templateUrl: './counts-and-totals.component.html',
    styleUrls: ['./counts-and-totals.component.less'],
    providers: [ DashboardServiceProxy, LifecycleSubjectsService ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CountsAndTotalsComponent implements OnInit, OnChanges, OnDestroy {
    @Input() data: GetTotalsOutput;
    @Input() fields: TotalsDataField[];
    totalsDataLoading$ = this.dashboardService.totalsDataLoading$.pipe(takeUntil(this.lifeCycleService.destroy$));
    localization = AppConsts.localization.CRMLocalizationSourceName;

    constructor(
        private dashboardService: DashboardWidgetsService,
        private lifeCycleService: LifecycleSubjectsService,
        private loadingService: LoadingService,
        private elementRef: ElementRef,
        private changeDetectorRef: ChangeDetectorRef,
        public ls: AppLocalizationService
    ) {}

    ngOnInit() {
        this.totalsDataLoading$.pipe(
            takeUntil(this.lifeCycleService.destroy$)
        ).subscribe((loading: boolean) => {
            loading
                ? this.loadingService.startLoading(this.elementRef.nativeElement)
                : this.loadingService.finishLoading(this.elementRef.nativeElement);
        });
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.data && changes.data.currentValue) {
            this.fields.forEach((field: TotalsDataField) => {
                field.percent = this.dashboardService.getPercentage(
                    changes.data.currentValue[field.name.replace('total', 'new')],
                    changes.data.currentValue[field.name]
                );
            });
            this.changeDetectorRef.detectChanges();
        }
    }

    ngOnDestroy() {
        this.lifeCycleService.destroy.next();
    }
}
