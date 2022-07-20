import { KeysEnum } from '@shared/common/keys.enum/keys.enum';
import { UserInvoiceDto } from './invoice-dto.interface';

export const InvoiceFields: KeysEnum<UserInvoiceDto> = {
    Amount: 'Amount',
    Date: 'Date',
    DueDate: 'DueDate',
    Id: 'Id',
    Number: 'Number',
    Status: 'Status'
};