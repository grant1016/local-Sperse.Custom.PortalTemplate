import { Injectable } from '@angular/core';
import { Alignment, Border, Borders, Fill, Worksheet } from 'exceljs';
import { CellRange } from 'devextreme/excel_exporter';
import * as moment from 'moment';

@Injectable()
export class ReferralExportService {
    thinBorder: Partial<Border> = { style: 'thin', color: { argb: '#000' }};
    static addTableHeader(worksheet: Worksheet, title: string) {
        const headerRow = worksheet.getRow(2);
        headerRow.height = 30;
        worksheet.mergeCells(2, 2, 2, 8);
        headerRow.getCell(2).value = title;
        headerRow.getCell(2).font = { size: 18, bold: true };
        headerRow.getCell(2).alignment = { horizontal: 'center' };
    }
    static currencyFormat = '"$"#,##0.00;[Red]("$"#,##0.00)';

    addAmountsWidget(
        worksheet: Worksheet,
        color: string,
        startColumnIndex: number,
        title: string,
        columns: { name: string, value: number }[]
    ) {
        const widgetHeaderRow = worksheet.getRow(4);
        if (columns.length > 1) {
            worksheet.mergeCells(4, startColumnIndex, 4, startColumnIndex + columns.length - 1);
        }
        const titleCell = widgetHeaderRow.getCell(startColumnIndex);
        const centerAlignment: Partial<Alignment> = { horizontal: 'center' };
        const fill: Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: color } };
        titleCell.value = title;
        titleCell.alignment = centerAlignment;
        titleCell.fill = fill;
        titleCell.font = {
            size: 11,
            bold: true
        };
        titleCell.border = {
            top: this.thinBorder,
            left: this.thinBorder,
            right: this.thinBorder
        };

        const widgetColumnsHeaderRow = worksheet.getRow(5);
        const widgetColumnsValuesRow = worksheet.getRow(6);
        columns.forEach((column, index: number) => {
            const headerCell = widgetColumnsHeaderRow.getCell(startColumnIndex + index);
            headerCell.value = column.name;
            headerCell.alignment = centerAlignment;
            headerCell.fill = fill;
            headerCell.font = {
                size: 12,
                underline: true
            };

            const valueCell = widgetColumnsValuesRow.getCell(startColumnIndex + index);
            valueCell.value = column.value;
            valueCell.alignment = centerAlignment;
            valueCell.fill = fill;
            valueCell.font = {
                size: 14,
                bold: true
            };
            valueCell.numFmt = ReferralExportService.currencyFormat;
            let valueCellBorder: Partial<Borders> = { bottom: this.thinBorder };
            if (index === 0) {
                let headerCellBorder: Partial<Borders> = { left: this.thinBorder };
                if (columns.length === 1) {
                    headerCellBorder = { ...headerCellBorder, right: this.thinBorder };
                    valueCellBorder = { ...valueCellBorder, right: this.thinBorder };
                }
                headerCell.border = headerCellBorder;
                valueCell.border = { ...valueCellBorder, left: this.thinBorder };
            } else if (index === columns.length - 1) {
                headerCell.border = { right: this.thinBorder };
                valueCell.border = { ...valueCellBorder, right: this.thinBorder };
            }
        });
    }

    static getFileName(prefix: string) {
        return `${prefix}_${moment().format('YYYY-MM-DD_hhmmss_a')}.xlsx`;
    }

    addTableBorders(worksheet: Worksheet, cellRange: CellRange, headerRowsAmount?: number) {
        for (let rowIndex = cellRange.from.row; rowIndex <= cellRange.to.row; rowIndex++) {
            for (let columnIndex = cellRange.from.column; columnIndex <= cellRange.to.column; columnIndex++) {
                let border: Partial<Borders> = {};
                if (columnIndex === cellRange.from.column) {
                    border.left = this.thinBorder;
                }

                if (rowIndex === cellRange.from.row || (headerRowsAmount && rowIndex <= cellRange.from.row + headerRowsAmount)) {
                    /** Borders for header row */
                    border.top = border.bottom = this.thinBorder;
                } else {
                    /** Border for data row */
                    border.bottom = { style: rowIndex === cellRange.to.row ? 'thin' : 'dotted', color: { argb: '#000' } };
                }

                if (columnIndex === cellRange.to.column) {
                    border.right = this.thinBorder;
                }
                worksheet.getCell(rowIndex, columnIndex).border = border;
            }
        }
    }

    addMergedColumnLeftBorder(worksheet: Worksheet, cellRange: CellRange) {
        /** Add left border to the first merged column */
        const topMergedColumn = worksheet.getCell(cellRange.from.row, cellRange.from.column + 2);
        topMergedColumn.border = { ...topMergedColumn.border, left: this.thinBorder };
    }
}