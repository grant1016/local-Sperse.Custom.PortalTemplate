import { InvoiceStatus } from '@shared/service-proxies/service-proxies';

export interface UserInvoiceDto {
    Amount: number;
    Date: string;
    DueDate: string;
    Id: number;
    Number: string;
    Status: InvoiceStatus;
}