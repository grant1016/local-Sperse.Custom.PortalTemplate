import { AppFeatures } from '@shared/AppFeatures';
import { AppPermissions } from '@shared/AppPermissions';
import { ConfigInterface } from '@app/shared/common/config.interface';
import { ConfigNavigation } from '@app/shared/common/config-navigation.interface';

export class MainConfig implements ConfigInterface {
    code = 'Main';
    name = 'Main';
    requiredFeature;
    requiredPermission;
    localizationSource = 'CRM';
    navigation: ConfigNavigation[] = [
        {
            icon: 'dashboard',
            text: 'Dashboard',
            route: '/app/dashboard'
        },
        {
            icon: 'refferals',
            text: 'RefferedLeads',
            route: '/app/leads'
        },
        {
            icon: 'invoices',
            text: 'MyInvoices',
            route: '/app/invoices'
        },
        {
            icon: 'ambassadors',
            text: 'MyRefferalPortal',
            route: '/app/reseller-info'
        },
        {
            icon: 'crm',
            text: 'CRMLogin',
            route: 'platform',
            permission: AppPermissions.CRM,
            feature: AppFeatures.CRM
        }
    ];
}