import { KeysEnum } from '@shared/common/keys.enum/keys.enum';
import { CommissionDto } from './commission-dto';

export const CommissionFields: KeysEnum<CommissionDto> = {
    Id: 'Id',
    OrderDate: 'OrderDate',
    OrderNumber: 'OrderNumber',
    EarnedDate: 'EarnedDate',
    CustomerName: 'CustomerName',
    ProductName: 'ProductName',
    ProductAmount: 'ProductAmount',
    Tier: 'Tier',
    CommissionAmount: 'CommissionAmount',
    CurrencyId: 'CurrencyId',
    Status: 'Status'
};