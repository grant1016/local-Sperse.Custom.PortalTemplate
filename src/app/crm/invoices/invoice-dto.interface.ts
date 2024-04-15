import { InvoiceStatus } from '@shared/service-proxies/service-proxies';

export interface UserInvoiceDto {
    Amount: number;
    CurrencyId: string;
    Date: string;
    DueDate: string;
    Id: number;
    Number: string;
    Status: InvoiceStatus;
}