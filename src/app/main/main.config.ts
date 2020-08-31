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
            text: 'Home',
            route: '/app/home'
        },
        {
            text: 'Dashboard',
            route: '/app/dashboard'
        },
        {
            text: 'CRM',
            route: 'platform',
            permission: AppPermissions.CRM,
            feature: AppFeatures.CRM
        }
    ];
}