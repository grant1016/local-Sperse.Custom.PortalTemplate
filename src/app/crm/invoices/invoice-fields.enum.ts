import { KeysEnum } from '@shared/common/keys.enum/keys.enum';
import { UserInvoiceDto } from './invoice-dto.interface';

export const InvoiceFields: KeysEnum<UserInvoiceDto> = {
    Amount: 'Amount',
    CurrencyId: 'CurrencyId',
    Date: 'Date',
    DueDate: 'DueDate',
    Id: 'Id',
    Number: 'Number',
    Status: 'Status'
};