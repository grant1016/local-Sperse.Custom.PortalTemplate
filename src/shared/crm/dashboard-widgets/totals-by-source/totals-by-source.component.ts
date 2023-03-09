/** Core imports */
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    OnDestroy,
    OnInit,
    ViewChild
} from '@angular/core';

/** Third party imports */
import * as _ from 'underscore';
import { Store, select } from '@ngrx/store';
import { DxPieChartComponent } from 'devextreme-angular/ui/pie-chart';
import { BehaviorSubject, Observable, combineLatest, of } from 'rxjs';
import {
    catchError,
    finalize,
    publishReplay,
    refCount,
    switchMap,
    tap,
    takeUntil,
    map,
    pluck,
    withLatestFrom,
    first,
    debounceTime
} from 'rxjs/operators';

/** Application imports */
import { AppStore, PipelinesStoreSelectors } from '@app/store';
import { StageDtoExtended } from '@app/store/pipelines-store/stage-dto-extended.interface';
import { DashboardServiceProxy } from 'shared/service-proxies/service-proxies';
import { DashboardWidgetsService } from '../dashboard-widgets.service';
import { LoadingService } from '@shared/common/loading-service/loading.service';
import { LayoutType } from '@shared/service-proxies/service-proxies';
import { AppLocalizationService } from '@app/shared/common/localization/app-localization.service';
import { LifecycleSubjectsService } from '@shared/common/lifecycle-subjects/lifecycle-subjects.service';
import { AppSessionService } from '@shared/common/session/app-session.service';
import { ContactGroup } from '@shared/AppEnums';
import { LayoutService } from '@app/shared/layout/layout.service';
import { StarsHelper } from '@shared/common/stars-helper/stars-helper';
import { PeriodModel } from '@app/shared/common/period/period.model';
import { ITotalOption } from './total-options.interface';
import { AppConsts } from '@shared/AppConsts';

@Component({
    selector: 'totals-by-source',
    templateUrl: './totals-by-source.component.html',
    styleUrls: ['./totals-by-source.component.less'],
    providers: [ LifecycleSubjectsService ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TotalsBySourceComponent implements OnInit, OnDestroy {
    @ViewChild(DxPieChartComponent) chartComponent: DxPieChartComponent;

    onDrawTimeout: any;
    data$: Observable<any[]>;
    totalCount$: Observable<number>;
    totalCount: string;
    rangeColors = [
        this.layoutService.getLayoutColor('blue'),
        this.layoutService.getLayoutColor('purple'),
        this.layoutService.getLayoutColor('green'),
        this.layoutService.getLayoutColor('orange'),
        '#bde0ff',
        '#6da6d9',
        '#a2e18c',
        '#54c24d',
        '#fed142',
        '#ffab3e'
    ];

    rawData: any[];
    percentage: string;
    rangeCount: string;
    rangeName: string;
    rangeColor: string;
    totalNumbersTop: string;
    totalsOptions: ITotalOption[] = [{
        key: 'star',
        label: this.ls.l('TotalsByStar/CreditRating'),
        method: this.dashboardServiceProxy.getContactsByStar,
        argumentField: 'key',
        valueField: 'count',
        getColor: (item) => {
            return StarsHelper.getStarColorByType(this.rawData[item.index].colorType);
        }
    }, {
        key: 'stageDistribution',
        label: this.ls.l('TotalsByStageDistribution'),
        method: this.dashboardServiceProxy.getLeadsCountByStage,
        argumentField: 'key',
        valueField: 'count',
        getColor: (item) => {
            const stage: StageDtoExtended = this.getStageByName(item.argument);
            return this.dashboardWidgetsService.getStageDefaultColorByStageSortOrder(stage.sortOrder);
        }
    }, {
        key: 'ageDistribution',
        label: this.ls.l('TotalsByLeadAgeDistribution'),
        method: this.dashboardServiceProxy.getLeadsCountByAge,
        argumentField: 'key',
        valueField: 'count'
    }, {
        key: 'companySize',
        label: this.ls.l('TotalsByCompanySize'),
        method: this.dashboardServiceProxy.getContactsByCompanySize,
        argumentField: 'companySizeRange',
        valueField: 'contactCount',
        sorting: (a, b) => {
            return (parseInt(a.companySizeRange) || Infinity) > (parseInt(b.companySizeRange) || Infinity) ? 1 : -1;
        }
    }, {
        key: 'rating',
        label: this.ls.l('TotalsByRating'),
        method: this.dashboardServiceProxy.getContactsByRating,
        argumentField: 'key',
        valueField: 'count'
    }];
    selectedTotal: BehaviorSubject<ITotalOption> = new BehaviorSubject<ITotalOption>(
        this.totalsOptions.find(option => option.key === 'companySize')
    );
    localization = AppConsts.localization.CRMLocalizationSourceName;
    selectedTotal$: Observable<ITotalOption> = this.selectedTotal.asObservable();
    selectedArgumentField$: Observable<string> = this.selectedTotal$.pipe(pluck('argumentField'));
    selectedValueField$: Observable<string> = this.selectedTotal$.pipe(pluck('valueField'));
    stages: StageDtoExtended[];
    loading = false;

    constructor(
        private store$: Store<AppStore.State>,
        private dashboardWidgetsService: DashboardWidgetsService,
        private dashboardServiceProxy: DashboardServiceProxy,
        private elementRef: ElementRef,
        private loadingService: LoadingService,
        private lifeCycleService: LifecycleSubjectsService,
        private changeDetectorRef: ChangeDetectorRef,
        private appSession: AppSessionService,
        private layoutService: LayoutService,
        public ls: AppLocalizationService
    ) {
        this.store$.pipe(select(PipelinesStoreSelectors.getPipelinesStages({
            purpose: AppConsts.PipelinePurposeIds.lead,
            contactGroupId: ContactGroup.Client
        }))).pipe(first()).subscribe((stages: StageDtoExtended[]) =>  this.stages = stages);
    }

    ngOnInit() {
        this.data$ = combineLatest(
            this.selectedTotal$,
            this.dashboardWidgetsService.period$,
            this.dashboardWidgetsService.contactGroupId$,
            this.dashboardWidgetsService.contactId$,
            this.dashboardWidgetsService.sourceOrgUnitIds$,
            this.dashboardWidgetsService.refresh$
        ).pipe(
            debounceTime(100),
            takeUntil(this.lifeCycleService.destroy$),
            tap(() => {
                this.loading = true;
                this.totalNumbersTop = this.rangeCount = this.totalCount = '';
                this.loadingService.startLoading(this.elementRef.nativeElement);
            }),
            switchMap(([selectedTotal, period, groupId, contactId, orgUnitIds, ]:
                           [ITotalOption, PeriodModel, string, number, number[], null]) => selectedTotal.method.call(
                    this.dashboardServiceProxy, period && period.from || new Date('2000-01-01'),
                    period && period.to || new Date(), groupId, contactId, orgUnitIds
                ).pipe(
                    catchError(() => of([])),
                    finalize(() => this.loadingService.finishLoading(this.elementRef.nativeElement))
                )
            ),
            map((data: any[]) => {
                this.rawData = data;
                return (this.selectedTotal.value.sorting ? data.sort(this.selectedTotal.value.sorting) : data)
                    .map((item: any) => {
                        item[this.selectedTotal.value.argumentField] = this.ls.l(
                            item[this.selectedTotal.value.argumentField] || 'Unknown');
                        return item;
                    });
            }),
            tap(() => this.loading = false),
            publishReplay(),
            refCount()
        );

        this.totalCount$ = this.data$.pipe(
            withLatestFrom(this.selectedValueField$),
            map(([data, valueField]: [any[], string]) => data.reduce((total: number, customer: any) => {
                return total + customer[valueField];
            }, 0))
        );
        this.totalCount$.subscribe((totalCount: number) => {
            this.rangeCount = this.totalCount = totalCount.toLocaleString('en');
        });
    }

    customizePoint = (data) => {
        return {
            color: this.getItemColor(data)
        };
    }

    private getStageByName(stageName: string): StageDtoExtended  {
        return _.findWhere(this.stages, {name: stageName});
    }

    private getItemColor(item) {
        return item.argument == 'Unknown'
            ? '#bbb'
            : this.selectedTotal.value.getColor ? this.selectedTotal.value.getColor(item) : this.rangeColors[item.index];
    }

    getLegendMarkerColor = (item) => item.marker.fill;

    onPointHoverChanged($event) {
        let isHoverIn = $event.target.fullState, item = $event.target;
        this.percentage = isHoverIn ? (item.percent * 100).toFixed(1) + '%' : '';
        this.rangeCount = (isHoverIn ? item.initialValue : this.totalCount).toLocaleString('en');
        this.rangeColor = isHoverIn ? this.getItemColor(item) : undefined;
        this.rangeName = item.argument;
        this.changeDetectorRef.detectChanges();
    }

    onDrawn(e) {
        clearTimeout(this.onDrawTimeout);
        this.onDrawTimeout = setTimeout(() => {
            this.updatePieChartTopPositions(e);
        }, 600);
    }

    private updatePieChartTopPositions(e) {
        const componentTop = this.elementRef.nativeElement.getBoundingClientRect().top;
        const chart = e.element.querySelector('.dxc-series');
        if (componentTop && chart) {
            const circleBoundingRect = chart.getBoundingClientRect(),
                  circleTop = circleBoundingRect.top,
                  circleCenterY = circleTop - componentTop + (circleBoundingRect.height) / 2,
                  paddingTop = circleCenterY - 55;
            if (paddingTop <= 0)
                return this.onDrawn(e);    
            this.totalNumbersTop = paddingTop + 'px';
            this.changeDetectorRef.detectChanges();
        }
    }

    ngOnDestroy() {
        this.lifeCycleService.destroy.next();
    }
}