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
            route: '/app/dashboard',
            permission: AppPermissions.CRMCustomers,
            feature: AppFeatures.PortalDashboard
        },
        {
            icon: 'refferals',
            text: 'RefferedLeads',
            route: '/app/leads',
            permission: AppPermissions.CRMCustomers + '|' + AppPermissions.CRMPartners + '|' + AppPermissions.CRMEmployees + '|' + AppPermissions.CRMInvestors + '|' + AppPermissions.CRMVendors + '|' + AppPermissions.CRMOthers,
            feature: AppFeatures.PortalLeads
        },
        {
            icon: 'invoices',
            text: 'MyInvoices',
            route: '/app/invoices',
            feature: AppFeatures.PortalInvoices
        },
        {
            icon: 'ambassadors',
            text: 'MyReferralPortal',
            route: '/app/reseller-info',
            feature: AppFeatures.PortalReseller
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