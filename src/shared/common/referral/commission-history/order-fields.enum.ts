import { KeysEnum } from '@shared/common/keys.enum/keys.enum';
import { OrderDto } from './order-dto';

export const OrderFields: KeysEnum<OrderDto> = {
    Id: 'Id',
    Name: 'Name',
    Amount: 'Amount',
    OrderType: 'OrderType',
    OrderDate: 'OrderDate',
    PersonalAffiliateCode: 'PersonalAffiliateCode',
    SourceAffiliateCode: 'SourceAffiliateCode',
    SourceEntryUrl: 'SourceEntryUrl'
};