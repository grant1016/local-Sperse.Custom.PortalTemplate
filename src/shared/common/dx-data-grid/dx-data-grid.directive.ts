/** Core imports */
import { Directive, OnDestroy, Renderer2, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';

/** Third party imports */
import { ClipboardService } from 'ngx-clipboard';
import { NotifyService } from 'abp-ng2-module';
import { DxDataGridComponent } from 'devextreme-angular/ui/data-grid';

/** Application imports */
import { AppLocalizationService } from '@app/shared/common/localization/app-localization.service';
import { AppConsts } from '@shared/AppConsts';
import { DateHelper } from '@shared/helpers/DateHelper';

@Directive({
    selector: 'dx-data-grid',
    providers: [ DatePipe ]
})
export class DxDataGridDirective implements OnInit, OnDestroy {
    private clipboardIcon;
    private subscriptions = [];
    private timezone = DateHelper.getUserTimezone();
    private copyToClipboard = (event) => {
        this.clipboardService.copyFromContent(event.target.parentNode.innerText.trim());
        this.notifyService.info(this.ls.l('SavedToClipboard'));
        event.stopPropagation();
        event.preventDefault();
    }

    constructor(
        private datePipe: DatePipe,
        private renderer: Renderer2,
        private ls: AppLocalizationService,
        private notifyService: NotifyService,
        private component: DxDataGridComponent,
        private clipboardService: ClipboardService
    ) {
        this.clipboardIcon = this.renderer.createElement('i');
        this.clipboardIcon.addEventListener('click', this.copyToClipboard, true);
        this.renderer.addClass(this.clipboardIcon, 'save-to-clipboard');
    }

    ngOnInit() {
        this.subscriptions.push(
            this.component.onInitialized.subscribe(event => {
                this.checkInitDateCellColumn(event.component);
            }),
            this.component.onOptionChanged.subscribe(event => {
                if (event.name == 'dataSource' || event.name == 'summary')
                    setTimeout(() => this.checkInitDateCellColumn(event.component));
            }),
            this.component.onCellHoverChanged.subscribe(event => {
                if (event.rowType == 'data') {
                    if (event.eventType == 'mouseover') {
                        if (event.column.name == 'hiddenTime') {
                            let text = event.cellElement.querySelector('span');
                            if (!text) {
                                event.cellElement.innerHTML = '';
                                text = this.renderer.createElement('span');
                                this.renderer.appendChild(event.cellElement, text);
                            }
                            text.innerText = this.getDateFormatted(event.data[event.column.dataField], event.column.format, false);
                        }
                        if (event.cellElement.classList.contains('clipboard-holder'))
                            this.appendClipboardIcon(event.cellElement);
                        else
                            this.appendClipboardIcon(event.cellElement.querySelector('.clipboard-holder'));
                    }
                    if (event.eventType == 'mouseout') {
                        if (event.column.name == 'hiddenTime') {
                            let text = event.cellElement.querySelector('span');
                            text.innerText = event.value ? this.getDateFormatted(event.data[event.column.dataField], event.column.format) : '';
                        }
                    }
                }
            })
        );
    }

    appendClipboardIcon(elm) {
        if (elm && elm.innerText.trim() && !elm.querySelector('i'))
            this.renderer.appendChild(elm, this.clipboardIcon);
    }

    checkInitDateCellColumn(component) {
        this.updateDateColumns(component.option('columns'), component);
    }

    updateDateColumns(columns, component) {
        columns.forEach(column => {
            if (column.columns) {
                this.updateDateColumns(column.columns, component);
            } else if (column.dataType === 'date') {
                this.initDateCellColumn(column, component);
            }
        });
    }

    initDateCellColumn(column, component) {
        component.columnOption(column.dataField, 'name', 'hiddenTime');
        component.columnOption(column.dataField, 'width', '230px');
        component.columnOption(column.dataField, 'cellTemplate', undefined);
        component.columnOption(column.dataField, 'cssClass', column.cssClass + ' clipboard-holder');
        component.columnOption(column.dataField, 'calculateCellValue', (data) => {
            return this.getDateFormatted(data[column.dataField], column.format);
        });
    }

    getDateFormatted(value: string, dateFormat: string,  withoutTime: boolean = true) {
        let date = value && this.datePipe.transform(
            value,
            (dateFormat || AppConsts.formatting.date) + (withoutTime ? '' : ' ' +  AppConsts.formatting.time),
            this.timezone
        );
        return date || '';
    }

    ngOnDestroy() {
        this.subscriptions.forEach(sub => sub.unsubscribe());
        this.clipboardIcon.removeEventListener('click', this.copyToClipboard);
        this.renderer.removeClass(this.clipboardIcon, 'save-to-clipboard');
        if (this.clipboardIcon.parentNode)
            this.renderer.removeChild(this.clipboardIcon.parentNode, this.clipboardIcon);
    }
}