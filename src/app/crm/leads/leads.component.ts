/** Core imports */
import { AfterViewInit, Component, Injector, OnDestroy, OnInit, ViewChild } from '@angular/core';

/** Third party imports */
import DataSource from 'devextreme/data/data_source';
import ODataStore from 'devextreme/data/odata/store';
import { DxDataGridComponent } from 'devextreme-angular/ui/data-grid';
import { select, Store } from '@ngrx/store';
import { BehaviorSubject, combineLatest, concat, from, Observable, of } from 'rxjs';
import { filter, first, map, skip, switchMap, takeUntil } from 'rxjs/operators';
import invert from 'lodash/invert';

/** Application imports */
import { AppConsts } from '@shared/AppConsts';
import { ContactGroup } from '@shared/AppEnums';
import { AppService } from '@app/app.service';
import {
    AppStore,
    PipelinesStoreSelectors,
    ListsStoreSelectors,
    RatingsStoreSelectors,
    StarsStoreSelectors,
    TagsStoreSelectors
} from '@app/store';
import { AppComponentBase } from '@shared/common/app-component-base';
import { FiltersService } from '@shared/filters/filters.service';
import { FilterModel } from '@shared/filters/models/filter.model';
import { FilterItemModel } from '@shared/filters/models/filter-item.model';
import { FilterInputsComponent } from '@shared/filters/inputs/filter-inputs.component';
import { FilterCalendarComponent } from '@shared/filters/calendar/filter-calendar.component';
import { FilterCheckBoxesComponent } from '@shared/filters/check-boxes/filter-check-boxes.component';
import { FilterCheckBoxesModel } from '@shared/filters/check-boxes/filter-check-boxes.model';
import { FilterRangeComponent } from '@shared/filters/range/filter-range.component';
import { FilterStatesComponent } from '@shared/filters/states/filter-states.component';
import { FilterStatesModel } from '@shared/filters/states/filter-states.model';
import {
    LayoutType,
    PipelineDto,
} from '@shared/service-proxies/service-proxies';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { TagsListComponent } from '@app/shared/common/lists/tags-list/tags-list.component';
import { ListsListComponent } from '@app/shared/common/lists/lists-list/lists-list.component';
import { RatingComponent } from '@app/shared/common/lists/rating/rating.component';
import { StarsListComponent } from '../shared/stars-list/stars-list.component';
import { StaticListComponent } from '@app/shared/common/static-list/static-list.component';
import { LifecycleSubjectsService } from '@shared/common/lifecycle-subjects/lifecycle-subjects.service';
import { AppPermissions } from '@shared/AppPermissions';
import { DataGridService } from '@app/shared/common/data-grid.service/data-grid.service';
import { AppSessionService } from '@shared/common/session/app-session.service';
import { ToolbarGroupModel } from '@app/shared/common/toolbar/toolbar.model';
import { ActionMenuService } from '@app/shared/common/action-menu/action-menu.service';
import { ToolBarComponent } from '@app/shared/common/toolbar/toolbar.component';
import { FilterStatesService } from '@shared/filters/states/filter-states.service';
import { FilterMultilineInputComponent } from '@root/shared/filters/multiline-input/filter-multiline-input.component';
import { FilterMultilineInputModel } from '@root/shared/filters/multiline-input/filter-multiline-input.model';
import { ODataRequestValues } from '@shared/common/odata/odata-request-values.interface';
import { LeadDto } from '@app/crm/leads/lead-dto.interface';
import { KeysEnum } from '@shared/common/keys.enum/keys.enum';
import { LeadFields } from '@app/crm/leads/lead-fields.enum';
import { ActionMenuGroup } from '@app/shared/common/action-menu/action-menu-group.interface';
import { ExportService } from '@shared/common/export/export.service';
import { ODataService } from '@shared/common/odata/odata.service';

@Component({
    templateUrl: './leads.component.html',
    styleUrls: [
        '../shared/styles/grouped-action-menu.less',
        './leads.component.less'
    ],
    providers: [LifecycleSubjectsService],
    animations: [appModuleAnimation()]
})
export class LeadsComponent extends AppComponentBase implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild(DxDataGridComponent) dataGrid: DxDataGridComponent;
    @ViewChild(TagsListComponent) tagsComponent: TagsListComponent;
    @ViewChild(ListsListComponent) listsComponent: ListsListComponent;
    @ViewChild(RatingComponent) ratingComponent: RatingComponent;
    @ViewChild(StarsListComponent) starsListComponent: StarsListComponent;
    @ViewChild('stageList') stagesComponent: StaticListComponent;
    @ViewChild(ToolBarComponent) toolbar: ToolBarComponent;

    private readonly dataSourceURI = 'Lead';
    private readonly totalDataSourceURI = 'Lead/$count';
    private readonly dateField = 'LeadDate';
    private _selectedLeads: LeadDto[];
    rowsViewHeight: number;
    get selectedLeads(): LeadDto[] {
        return this._selectedLeads || [];
    }
    set selectedLeads(leads: LeadDto[]) {
        this._selectedLeads = leads;
        this.selectedClientKeys = [];
        leads.forEach((lead: LeadDto) => {
            if (lead && lead.CustomerId)
                this.selectedClientKeys.push(lead.CustomerId);
        });
        this.initToolbarConfig();
    }
    actionEvent: any;
    actionMenuGroups: ActionMenuGroup[] = [
        {
            key: '',
            visible: true,
            items: [
                {
                    text: this.l('Call'),
                    class: 'call',
                    disabled: true,
                    action: () => {}
                }
            ]
        }
    ];
    contactGroupId: BehaviorSubject<ContactGroup> = new BehaviorSubject(ContactGroup.Client);
    contactGroupId$: Observable<ContactGroup> = this.contactGroupId.asObservable();
    defaultGridPagerConfig = DataGridService.defaultGridPagerConfig;

    stages = [];
    selectedClientKeys = [];
    manageDisabled = true;
    manageCGPermision = '';

    filterModelLists: FilterModel;
    filterModelTags: FilterModel;
    filterDate = new FilterModel({
        component: FilterCalendarComponent,
        operator: { from: 'ge', to: 'le' },
        caption: 'creation',
        field: this.dateField,
        items: { from: new FilterItemModel(), to: new FilterItemModel() },
        options: { method: 'getFilterByDate', params: { useUserTimezone: true }, allowFutureDates: true }
    });
    filterModelStages: FilterModel;
    filterModelRating: FilterModel;
    filterModelStar: FilterModel;
    filterCountryStates: FilterModel = new FilterModel({
        component: FilterStatesComponent,
        caption: 'states',
        items: {
            countryStates: new FilterStatesModel(this.filterStatesService)
        }
    });

    private rootComponent: any;
    private exportCallback: Function;
    private filters: FilterModel[];
    formatting = AppConsts.formatting;

    permissions = AppPermissions;
    filterChanged$: Observable<FilterModel[]> = this.filtersService.filtersChanged$.pipe(
        filter(() => this.componentIsActivated)
    );
    odataRequestValues$: Observable<ODataRequestValues>;
    private _refresh: BehaviorSubject<null> = new BehaviorSubject<null>(null);
    private refresh$: Observable<null> = this._refresh.asObservable();

    private readonly CONTACT_GROUP_CACHE_KEY = 'CONTACT_GROUP';
    readonly leadFields: KeysEnum<LeadDto> = LeadFields;
    totalCount: number;
    toolbarConfig: ToolbarGroupModel[];
    private _activate: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
    private activate$: Observable<boolean> = this._activate.asObservable();
    hasBulkPermission: boolean = this.permission.isGranted(AppPermissions.CRMBulkUpdates);

    constructor(
        injector: Injector,
        private oDataService: ODataService,
        private exportService: ExportService,
        private filtersService: FiltersService,
        private store$: Store<AppStore.State>,
        private lifeCycleSubjectsService: LifecycleSubjectsService,
        private sessionService: AppSessionService,
        private filterStatesService: FilterStatesService,
        public appService: AppService
    ) {
        super(injector);
        this.odataRequestValues$ = concat(
            this.oDataService.getODataFilter(
                [this.filterDate, this.filterCountryStates],
                this.filtersService.getCheckCustom
            ).pipe(first()),
            this.filterChanged$.pipe(
                switchMap(() => this.oDataService.getODataFilter(this.filters, this.filtersService.getCheckCustom))
            )
        ).pipe(
            filter((odataRequestValues: ODataRequestValues) => !!odataRequestValues)
        );
        this.dataSource = {
            uri: this.dataSourceURI,
            requireTotalCount: true,
            store: {
                key: this.leadFields.Id,
                type: 'odata',
                url: this.oDataService.getODataUrl(this.dataSourceURI, this.getInitialFilter()),
                version: AppConsts.ODataVersion,
                beforeSend: (request) => {
                    request.params.contactGroupId = this.contactGroupId.value;
                    request.headers['Authorization'] = 'Bearer ' + abp.auth.getToken();
                    request.params.$select = DataGridService.getSelectFields(
                        this.dataGrid,
                        [
                            this.leadFields.Id,
                            this.leadFields.CustomerId,
                            this.leadFields.OrganizationId,
                            this.leadFields.UserId,
                            this.leadFields.Email,
                            this.leadFields.Phone,
                        ]
                    );
                    request.timeout = AppConsts.ODataRequestTimeoutMilliseconds;
                },
                deserializeDates: false
            }
        };
        this.totalDataSource = new DataSource({
            paginate: false,
            store: new ODataStore({
                version: AppConsts.ODataVersion,
                beforeSend: (request) => {
                    this.totalCount = undefined;
                    request.params.contactGroupId = this.contactGroupId.value;
                    request.headers['Authorization'] = 'Bearer ' + abp.auth.getToken();
                    request.timeout = AppConsts.ODataRequestTimeoutMilliseconds;
                },
                onLoaded: (count: any) => {
                    this.totalCount = count;
                }
            })
        });
        this.searchValue = '';
    }

    ngOnInit() {
        this.initStages();
        this.handleTotalCountUpdate();
        this.handleDataGridUpdate();
        this.activate();
        this.handleFiltersPining();
    }

    ngAfterViewInit() {
        this.initDataSource();
    }

    private getInitialFilter() {
        return [
            this.filterDate.getODataFilterObject(),
            this.filtersService.getCheckCustom(this.filterCountryStates)
        ];
    }

    private handleFiltersPining() {
        const filterFixed$ = this.filtersService.filterFixed$.pipe(
            takeUntil(this.lifeCycleSubjectsService.destroy$),
            skip(1)
        ).subscribe(() => {
            this.repaintDataGrid(1000);
        });
    }

    private handleTotalCountUpdate() {
        combineLatest(
            this.odataRequestValues$,
            this.refresh$,
            this.contactGroupId$
        ).pipe(
            takeUntil(this.lifeCycleSubjectsService.destroy$),
        ).subscribe(([odataRequestValues, ]) => {
            let url = this.oDataService.getODataUrl(this.totalDataSourceURI,
                odataRequestValues.filter, null, odataRequestValues.params);
            if (url && this.oDataService.requestLengthIsValid(url)) {
                this.totalDataSource['_store']['_requestDispatcher']['_url'] = url;
                this.totalDataSource.load();
            }
        });
    }

    private handleDataGridUpdate() {
        combineLatest(
            this.odataRequestValues$,
            this.contactGroupId$,
            this.refresh$
        ).pipe(
            takeUntil(this.lifeCycleSubjectsService.destroy$)
        ).subscribe(() => {
            this.processFilterInternal();
        });
    }

    private get contactGroup(): string {
        return invert(ContactGroup)[this.contactGroupId.value.toString()];
    }

    toggleToolbar() {
        this.repaintDataGrid();
        this.filtersService.fixed = false;
        this.filtersService.disable();
        this.initToolbarConfig();
    }

    onContentReady(event) {
        if (this.exportCallback)
            this.exportCallback();
        else {
            this.setGridDataLoaded();
            event.component.columnOption('command:edit', {
                visibleIndex: -1,
                width: 40
            });
        }
        if (!this.rowsViewHeight)
            this.rowsViewHeight = DataGridService.getDataGridRowsViewHeight();
    }

    refresh() {
        this._refresh.next(null);
    }

    invalidate(quiet = false, stageId?: number) {
        this.activate$.pipe(filter(Boolean), first()).subscribe(() => {
            this.refresh();
        });
    }

    initFilterConfig(): void {
        if (this.filters) {
            this.filtersService.setup(this.filters);
            this.filtersService.checkIfAnySelected();
        } else {
            this.filtersService.setup(this.filters = [
                new FilterModel({
                    component: FilterInputsComponent,
                    operator: 'startswith',
                    caption: 'name',
                    items: {Name: new FilterItemModel()}
                }),
                new FilterModel({
                    component: FilterMultilineInputComponent,
                    caption: 'email',
                    filterMethod: this.filtersService.filterByMultiline,
                    field: 'Email',
                    items: {
                        element: new FilterMultilineInputModel({
                            ls: this.localizationService,
                            name: 'Email'
                        })
                    }
                }),
                new FilterModel({
                    component: FilterMultilineInputComponent,
                    caption: 'xref',
                    filterMethod: this.filtersService.filterByMultiline,
                    field: 'ContactXref',
                    items: {
                        element: new FilterMultilineInputModel({
                            ls: this.localizationService,
                            name: 'xref'
                        })
                    }
                }),
                new FilterModel({
                    component: FilterMultilineInputComponent,
                    caption: 'affiliateCode',
                    filterMethod: this.filtersService.filterByMultiline,
                    field: 'ContactAffiliateCode',
                    items: {
                        element: new FilterMultilineInputModel({
                            ls: this.localizationService,
                            name: 'AffiliateCode'
                        })
                    }
                }),
                this.filterDate,
                this.filterModelStages = new FilterModel({
                    component: FilterCheckBoxesComponent,
                    caption: 'stages',
                    items: {
                        element: new FilterCheckBoxesModel(
                            {
                                dataSource$: this.store$.pipe(
                                    select(PipelinesStoreSelectors.getPipelineTreeSource(
                                        { purpose: AppConsts.PipelinePurposeIds.lead })
                                    )
                                ),
                                nameField: 'name',
                                keyExpr: 'id'
                            })
                    }
                }),
                new FilterModel({
                    component: FilterMultilineInputComponent,
                    caption: 'phone',
                    filterMethod: this.filtersService.filterByMultiline,
                    field: 'Phone',
                    items: {
                        element: new FilterMultilineInputModel({
                            ls: this.localizationService,
                            name: 'Phone',
                            normalize: (phone) => phone.replace(/[^\d+]/g, '')
                        })
                    }
                }),
                this.filterCountryStates,
                new FilterModel({
                    component: FilterInputsComponent,
                    operator: 'startswith',
                    caption: 'city',
                    items: { City: new FilterItemModel() }
                }),
                new FilterModel({
                    component: FilterInputsComponent,
                    operator: 'contains',
                    caption: 'streetAddress',
                    items: { StreetAddress: new FilterItemModel() }
                }),
                new FilterModel({
                    component: FilterInputsComponent,
                    operator: 'startswith',
                    caption: 'zipCode',
                    items: { ZipCode: new FilterItemModel() }
                }),
                new FilterModel({
                    component: FilterInputsComponent,
                    operator: 'startswith',
                    caption: 'Industry',
                    items: { Industry: new FilterItemModel() }
                }),
                this.filterModelLists = new FilterModel({
                    component: FilterCheckBoxesComponent,
                    caption: 'List',
                    field: 'ListId',
                    items: {
                        element: new FilterCheckBoxesModel(
                            {
                                dataSource$: this.store$.pipe(select(ListsStoreSelectors.getStoredLists)),
                                nameField: 'name',
                                keyExpr: 'id'
                            })
                    }
                }),
                this.filterModelTags = new FilterModel({
                    component: FilterCheckBoxesComponent,
                    caption: 'Tag',
                    field: 'TagId',
                    items: {
                        element: new FilterCheckBoxesModel(
                            {
                                dataSource$: this.store$.pipe(select(TagsStoreSelectors.getStoredTags)),
                                nameField: 'name',
                                keyExpr: 'id'
                            })
                    }
                }),
                this.filterModelRating = new FilterModel({
                    component: FilterRangeComponent,
                    operator: { from: 'ge', to: 'le' },
                    caption: 'Rating',
                    field: 'Rating',
                    items$: this.store$.pipe(select(RatingsStoreSelectors.getRatingItems))
                }),
                this.filterModelStar = new FilterModel({
                    component: FilterCheckBoxesComponent,
                    caption: 'Star',
                    field: 'StarId',
                    items: {
                        element: new FilterCheckBoxesModel(
                            {
                                dataSource$: this.store$.pipe(select(StarsStoreSelectors.getStars)),
                                nameField: 'name',
                                keyExpr: 'id',
                                templateFunc: (itemData) => {
                                    return `<div class="star-item">
                                    <span class="star star-${itemData.colorType.toLowerCase()}"></span>
                                    <span>${this.l(itemData.name)}</span>
                                </div>`;
                                }
                            })
                    }
                })
            ], this._activatedRoute.snapshot.queryParams);
        }
        this.filtersService.apply(() => {
            this.selectedClientKeys = [];
            this.initToolbarConfig();
        });
    }

    initToolbarConfig() {
        this.manageDisabled = !this.permission.checkCGPermission(this.contactGroupId.value);
        this.manageCGPermision = this.permission.getCGPermissionKey(this.contactGroupId.value, 'Manage');
        this.toolbarConfig = [
            {
                location: 'before', items: [
                    {
                        name: 'filters',
                        action: () => {
                            this.filtersService.fixed = !this.filtersService.fixed;
                        },
                        options: {
                            checkPressed: () => {
                                return this.filtersService.fixed;
                            },
                            mouseover: () => {
                                this.filtersService.enable();
                            },
                            mouseout: () => {
                                if (!this.filtersService.fixed)
                                    this.filtersService.disable();
                            }
                        },
                        attr: {
                            'filter-selected': this.filtersService.hasFilterSelected
                        }
                    }
                ]
            },
            {
                location: 'before',
                items: [
                    {
                        name: 'search',
                        widget: 'dxTextBox',
                        options: {
                            value: this.searchValue,
                            width: '279',
                            mode: 'search',
                            placeholder: this.l('Search') + ' ' + this.l('Leads').toLowerCase(),
                            onValueChanged: (e) => this.searchValueChange(e)
                        }
                    }
                ]
            },
            {
                location: 'before',
                locateInMenu: 'auto',
                items: [
                    {
                        name: 'stage',
                        disabled: this.manageDisabled,
                        action: this.toggleStages.bind(this),
                        attr: {
                            'filter-selected': this.filterModelStages && this.filterModelStages.isSelected
                        }
                    },
                    {
                        name: 'lists',
                        disabled: !this.permission.checkCGPermission(this.contactGroupId.value, ''),
                        action: this.toggleLists.bind(this),
                        attr: {
                            'filter-selected': this.filterModelLists && this.filterModelLists.isSelected
                        }
                    },
                    {
                        name: 'tags',
                        disabled: !this.permission.checkCGPermission(this.contactGroupId.value, ''),
                        action: this.toggleTags.bind(this),
                        attr: {
                            'filter-selected': this.filterModelTags && this.filterModelTags.isSelected
                        }
                    },
                    {
                        name: 'rating',
                        disabled: !this.permission.checkCGPermission(this.contactGroupId.value, ''),
                        action: this.toggleRating.bind(this),
                        attr: {
                            'filter-selected': this.filterModelRating && this.filterModelRating.isSelected
                        }
                    },
                    {
                        name: 'star',
                        disabled: !this.permission.checkCGPermission(this.contactGroupId.value, ''),
                        action: this.toggleStars.bind(this),
                        attr: {
                            'filter-selected': this.filterModelStar && this.filterModelStar.isSelected
                        }
                    }
                ]
            },
            {
                location: 'after',
                locateInMenu: 'auto',
                items: [
                    {
                        name: 'download',
                        widget: 'dxDropDownMenu',
                        options: {
                            hint: this.l('Download'),
                            items: [
                                {
                                    action: this.exportData.bind(this, options => {
                                        return this.exportService.exportToXLS(
                                            options,
                                            null,
                                            this.getUserGroup(this.contactGroup)
                                        );
                                    }),
                                    text: this.l('Export to Excel'),
                                    icon: 'xls'
                                },
                                {
                                    action: this.exportData.bind(this, options => 
                                        this.exportService.exportToCSV(
                                            options,
                                            null,
                                            this.getUserGroup(this.contactGroup)
                                        )
                                    ),
                                    text: this.l('Export to CSV'),
                                    icon: 'sheet'
                                },
                                {
                                    action: this.exportData.bind(this, options => 
                                        this.exportService.exportToGoogleSheet(
                                            options,
                                            null,
                                            this.getUserGroup(this.contactGroup)
                                        )
                                    ),
                                    text: this.l('Export to Google Sheets'),
                                    icon: 'sheet'
                                },
                                {
                                    type: 'downloadOptions'
                                }
                            ]
                        }
                    }
                ]
            }
        ];
    }

    private getUserGroup(contactGroup: string): string {
        return this.l('ContactGroup_' + contactGroup);
    }

    repaintDataGrid(delay = 0) {
        setTimeout(() => this.dataGrid.instance.repaint(), delay);
    }

    exportData(callback, options) {
        callback(options);
    }

    toggleCompactView() {
        this.dataGrid.instance.element().classList.toggle('grid-compact-view');
        this.dataGrid.instance.updateDimensions();
    }

    searchValueChange(e: object) {
        if (this.searchValue != e['value']) {
            this.searchValue = e['value'];
            this._refresh.next(null);
        }
    }

    processFilterInternal(contexts?: any[]) {
        const dataGridInstance = this.dataGrid && this.dataGrid.instance;
        if (dataGridInstance) {
            this.isDataLoaded = false;
            let quickSearch = this.getQuickSearchParam();
            this.oDataService.processODataFilter(
                dataGridInstance,
                this.dataSourceURI,
                this.filters,
                this.filtersService.getCheckCustom,
                this.searchColumns, this.searchValue, undefined,
                quickSearch ? [ quickSearch ] : undefined
            ).subscribe((filterQuery: string) => {
                if (filterQuery && filterQuery !== 'canceled') {
                    this.totalDataSource['_store']['_requestDispatcher']['_url'] = this.oDataService
                        .getODataUrl(this.totalDataSourceURI, filterQuery);
                    this.dataSource.store.url = this.oDataService
                        .getODataUrl(this.dataSourceURI, filterQuery);
                }
            });
        }
    }

    initDataSource() {
        this.setDataGridInstance();
    }

    private setDataGridInstance() {
        let instance = this.dataGrid && this.dataGrid.instance;
        if (instance && !instance.option('dataSource')) {
            instance.option('dataSource', this.dataSource);
            this.processFilterInternal();
            this.isDataLoaded = false;
        }
    }

    onSelectionChanged($event) {
        this.selectedLeads = $event.component.getSelectedRowsData();
    }

    initStages() {
        this.store$.pipe(select(PipelinesStoreSelectors.getPipeline({
            purpose: AppConsts.PipelinePurposeIds.lead,
            contactGroupId: this.contactGroupId.value
        }))).pipe(first()).subscribe(pipeline => {
            this.stages = pipeline.stages.map(stage => {
                return {
                    id: pipeline.id + ':' + stage.id,
                    index: stage.sortOrder,
                    name: stage.name
                };
            }).sort((prev, next) => prev.index > next.index ? -1 : 1);
        });
        this.initToolbarConfig();
    }

    onCellClick($event) {
        let col = $event.column;
        if (col && col.command)
            return;
    }

    toggleStages() {
        this.stagesComponent.toggle();
    }

    toggleLists() {
        this.listsComponent.toggle();
    }

    toggleTags() {
        this.tagsComponent.toggle();
    }

    toggleRating() {
        this.ratingComponent.toggle();
    }

    toggleStars() {
        this.starsListComponent.toggle();
    }

    toggleColumnChooser() {
        DataGridService.showColumnChooser(this.dataGrid);
    }

    repaintToolbar() {
        if (this.toolbar) {
            this.toolbar.toolbarComponent.instance.repaint();
        }
    }

    ngOnDestroy() {
        this.deactivate();
        this.lifeCycleSubjectsService.destroy.next();
    }

    activate() {
        super.activate();
        this.initFilterConfig();
        this.initToolbarConfig();
        this.rootComponent = this.getRootComponent();
        this.rootComponent.overflowHidden(true);
        this.showHostElement(() => {
            this.repaintToolbar();
        });
        this._activate.next(true);
    }

    deactivate() {
        super.deactivate();
        this._activate.next(false);
        this.filtersService.unsubscribe();
        this.rootComponent.overflowHidden();
        this.hideHostElement();
    }

    onShowingPopup(e) {
        e.component.option('visible', false);
        e.component.hide();
    }

    onLeadStageChanged(lead) {
        if (this.dataGrid && this.dataGrid.instance)
            this.dataGrid.instance.getVisibleRows().some((row) => {
                if (lead.Id == row.data.Id) {
                    row.data.Stage = lead.Stage;
                    row.data.StageId = lead.StageId;
                    return true;
                }
            });
    }

    toggleActionsMenu(event) {
        ActionMenuService.toggleActionMenu(event, this.actionEvent).subscribe((actionRecord) => {
            const lead: LeadDto = event.data;
            ActionMenuService.prepareActionMenuGroups(this.actionMenuGroups, lead);
            this.actionEvent = actionRecord;
        });
    }

    onMenuItemClick(event) {
        event.itemData.action.call(this);
        this.actionEvent = null;
    }
}