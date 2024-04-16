/** Core imports */
import { Injectable } from '@angular/core';

/** Third party imports */
import { Subscription, Subject, BehaviorSubject, Observable } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
import * as _ from 'underscore';
import capitalize from 'underscore.string/capitalize';
import each from 'lodash/each';

/** Application imports */
import { FilterModel } from './models/filter.model';
import { FilterItemModel } from '@shared/filters/models/filter-item.model';
import { ContactGroup, ContactStatus } from '../AppEnums';
import { FilterMultilineInputModel } from '@shared/filters/multiline-input/filter-multiline-input.model';
import { ServerCacheService } from '@shared/common/server-cache-service/server-cache.service';
import { MessageService } from 'abp-ng2-module';
import { AppLocalizationService } from '@app/shared/common/localization/app-localization.service';
import { AsyncFilter } from '@shared/filters/models/async-filter.model';

@Injectable()
export class FiltersService {
    private filters: FilterModel[];
    private subjectFilterToggle: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    private subjectFixedToggle: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    fixedToggle$: Observable<boolean> = this.subjectFixedToggle.asObservable().pipe(
        distinctUntilChanged()
    );
    private subjectFilters: Subject<FilterModel[]> = new Subject<FilterModel[]>();
    private filtersChanged: Subject<FilterModel[]> = new Subject<FilterModel[]>();
    filtersChanged$: Observable<FilterModel[]> = this.filtersChanged.asObservable();
    private subscribers: Array<Subscription> = [];
    private disableTimeout: any;

    public hasFilterSelected = false;
    get enabled(): boolean {
        return this.subjectFilterToggle.getValue();
    }
    set enabled(value: boolean) {
        this.subjectFilterToggle.next(value);
    }
    get fixed(): boolean {
        return this.subjectFixedToggle.getValue();
    }
    set fixed(value: boolean) {
        this.subjectFixedToggle.next(value);
    }

    filterFixed$ = this.subjectFixedToggle.asObservable();
    filterToggle$ = this.subjectFilterToggle.asObservable();
    filtersValues$: Observable<any> = this.filtersChanged$.pipe(
        map(() => {
            let filtersValues = {};
            this.filters.forEach((filterModel: FilterModel) => {
                filtersValues = {
                    ...filtersValues,
                    ...filterModel.getValues()
                };
            });
            return filtersValues;
        })
    );

    static filterByRating(filter: FilterModel) {
        let data = {};
        data[filter.field] = {};
        _.each(filter.items, (item: FilterItemModel, key) => {
            item && item.value && (data[filter.field][filter.operator[key]] = +item.value);
        });
        return data;
    }

    static filterByAmount(filter) {
        let data = {};
        data[filter.field] = {};
        each(filter.items, (item: FilterItemModel, key) => {
            item && item.value && (data[filter.field][filter.operator[key]] = +item.value);
        });
        return data;
    }

    static filterByStates(filter: FilterModel) {
        let data = {};
        let filterData = [];
        if (filter.items.countryStates && filter.items.countryStates.value) {
            filter.items.countryStates.value.forEach((val) => {
                let parts = val.split(':');
                filterData.push(parts.length == 2 ? {
                    CountryId: parts[0],
                    StateId: parts[1]
                } : {CountryId: val});
            });

            data = {
                or: filterData
            };
        }
        return data;
    }

    static filterByStages(filter: FilterModel) {
        let data = {};
        if (filter.items.element) {
            let filterData = FiltersService.ParsePipelineIds(filter.items.element.value);
            data = {
                or: filterData
            };
        }

        return data;
    }

    static ParsePipelineIds(data: string[]) {
        let filterData = [];
        if (data) {
            let pipelines = {};
            data.sort().forEach(item => {
                let parts = item.split(':'),
                    id = parts[0];
                if (!pipelines[id])
                    pipelines[id] = [];
                if (parts.length > 1)
                    pipelines[id].push(parts[1]);
            });
            _.mapObject(pipelines, (val, key) => {
                filterData.push('PipelineId eq ' + key + ' and StageId in (' + val.join(',') + ')');
            });
        }
        return filterData;
    }

    static filterByStar(filter: FilterModel) {
        return FiltersService.filterBySetOfValues(filter);
    }

    static filterByList(filter: FilterModel) {
        return FiltersService.filterBySetOfValues(filter);
    }

    static filterByTag(filter: FilterModel) {
        return FiltersService.filterBySetOfValues(filter);
    }

    static filterBySetOfValues(filter: FilterModel) {
        let data = {};
        let element = filter.items.element;
        if (element && element.value) {
            let filterData = _.map(element.value, x => {
                let el = {};
                el[filter.field] = x;
                return el;
            });

            data = {
                or: filterData
            };
        }
        return data;
    }

    static filterByStatus(filter: FilterModel) {
        return FiltersService.filterBySetOfValues(filter);
    }

    static filterByClientGroupId() {
        return { 'GroupId': {'eq': ContactGroup.Client} };
    }

    static filterByAccount(filter: FilterModel) {
        let data = {};
        if (filter.items.element) {
            let bankAccountIds = [];
            filter.items.element.dataSource.forEach((syncAccount) => {
                syncAccount.bankAccounts.forEach((bankAccount) => {
                    if (bankAccount['selected']) {
                        bankAccountIds.push(bankAccount.id);
                    }
                });
            });

            if (bankAccountIds.length) {
                //Should be like this, but IN is not currently implemented by odata-query lib >:-(. https://github.com/techniq/odata-query/issues/22
                //data = {
                //    BankAccountId: {
                //        in: bankAccountIds
                //    }
                //};

                data = `BankAccountId in (${bankAccountIds.join(',')})`;
            }
        }

        return data;
    }


    constructor(
        private serverCacheService: ServerCacheService
    ) {}

    filterByMultiline(filter: FilterModel): string[] | {[uuidName: string]: AsyncFilter} | 'cancelled' {
        let data: string[] | {[uuidName: string]: AsyncFilter} | 'cancelled' = [];
        let element = filter.items.element as FilterMultilineInputModel;
        if (element) {
            let valuesArray: string[] = element.valuesArray;
            if (valuesArray && valuesArray.length) {
                let inExpressions = [];
                const isLongFilter = valuesArray.length > 20;
                let normalizedValues = [];
                valuesArray.forEach((value: string) => {
                    let normalizedValue = value;
                    if (element.normalize) {
                        normalizedValue = element.normalize(value);
                    }
                    if (normalizedValue) {
                        if (!isLongFilter) {
                            inExpressions.push(`'${normalizedValue.replace(/'/g, "''")}'`);
                        }
                        normalizedValues.push(normalizedValue);
                    }
                });
                data = 'cancelled';
                if (isLongFilter) {
                    data = {
                        [ServerCacheService.filterNamesToCacheIdNames[filter.caption]]: new AsyncFilter(
                            this.serverCacheService.getServerCacheId(normalizedValues),
                            valuesArray.length
                        )
                    }
                } else if (inExpressions.length) {
                    data = element.manyToMany
                        ? [`${filter.field}/any(s:s in (${encodeURIComponent(inExpressions.join(','))}))`]
                        : [`${filter.field} in (${encodeURIComponent(inExpressions.join(','))})`];
                }
            }
        }

        return data;
    }

    setup(filters: FilterModel[], initialValues?: any, applyFilterImmediately = true): boolean {
        this.subjectFilters.next(this.filters = filters);
        if (initialValues && initialValues.filters) {
            let initFilters = JSON.parse(decodeURIComponent(initialValues.filters));
            filters && filters.forEach((filter) => {
                filter.clearFilterItems();
                if (initFilters[filter.caption]) {
                    let props = Object.keys(initFilters[filter.caption]);
                    props.forEach(val => {
                        if (filter.items[val].dispatchValue)
                            filter.items[val].dispatchValue(initFilters[filter.caption][val], filter);
                        else
                            filter.items[val] = initFilters[filter.caption][val];
                    });
                }
            });
            if (applyFilterImmediately)
                this.change([<FilterModel>{}]);
        }
        return this.checkIfAnySelected();
    }

    update(callback: (filters: FilterModel[]) => any) {
        this.subjectFilters.asObservable().subscribe(callback);
    }

    change(filters: FilterModel[]) {
        this.checkIfAnySelected();
        this.filtersChanged.next(filters);
    }

    apply(callback: (filters: FilterModel[]) => any, keepAlways: boolean = false) {
        let sub = this.filtersChanged$.subscribe(callback);
        if (!keepAlways)
            this.subscribers.push(sub);
    }

    clearAllFilters() {
        this.hasFilterSelected = false;
        this.filters.forEach(
            (filter: FilterModel) => filter.clearFilterItems()
        );
        this.change(null);
    }

    unsubscribe() {
        this.hasFilterSelected = false;
        this.subscribers.map((sub) => {
            return void (sub.unsubscribe());
        });
        this.subscribers.length = 0;
    }

    toggle() {
        this[this.enabled ? 'disable' : 'enable']();
    }

    enable() {
        this.preventDisable();
        this.enabled = true;
    }

    disable(callback: () => void = null) {
        this.preventDisable();
        this.disableTimeout = setTimeout(() => {
            callback && callback();
            this.fixed = false;
            this.enabled = false;
        }, 100);
    }

    preventDisable() {
        clearTimeout(this.disableTimeout);
        this.disableTimeout = null;
    }

    checkIfAnySelected(): boolean {
        this.hasFilterSelected = false;
        _.forEach(this.filters, (x) => {
            if (x.items) {
                x.isSelected = _.any(x.items, y => {
                    if (y && y.value && (!_.isArray(y.value)
                        || (y.value.length && y.value[0].hasOwnProperty && y.value[0].hasOwnProperty('value')
                              ? y.value.some(val => val.value)
                              : y.value.length
                        )
                    ))
                        return this.hasFilterSelected = true;
                    return false;
                });
            }
        });
        return this.hasFilterSelected;
    }

    getCheckCustom = (filter: FilterModel) => {
        let filterMethod = filter.filterMethod || FiltersService['filterBy' + capitalize(filter.caption)];
        if (filterMethod)
            return filterMethod.call(this, filter);
    }
}