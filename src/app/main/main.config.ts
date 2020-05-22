import { AppFeatures } from '@shared/AppFeatures';
import { AppPermissions } from '@shared/AppPermissions';
import { ConfigInterface } from '@app/shared/common/config.interface';
import { ConfigNavigation } from '@app/shared/common/config-navigation.interface';

export class MainConfig implements ConfigInterface {
    code = 'CRM';
    name = 'CRM';
    requiredFeature = AppFeatures.CRM;
    requiredPermission = AppPermissions.CRM;
    localizationSource = 'CRM';
    navigation: ConfigNavigation[] = [
        {
            text: 'Dashboard',
            route: '/app/dashboard'
        }
    ];
}