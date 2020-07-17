/** Core imports */
import { Injectable } from '@angular/core';

/** Third party imports */
import { TranslateService } from '@ngx-translate/core';

/** Application imports */
import { LocalizationService } from '@abp/localization/localization.service';
import { AppConsts } from '@shared/AppConsts';

@Injectable()
export class AppLocalizationService extends LocalizationService {
    localizationSourceName;

    constructor(
        private translate: TranslateService
    ) {
        super();
        translate.setDefaultLang('en');
    }

    l(key: string, ...args: any[]): string {
        let source: string = AppConsts.localization.defaultLocalizationSourceName;
        if (this.localizationSourceName)
            source = this.localizationSourceName;

        args.unshift(key);
        args.unshift(source);
        return this.ls.apply(this, args);
    }

    ls(sourcename: string, key: string, ...args: any[]): string {
        let source = abp.localization.values[sourcename];
        if (!source || !source[key])
            sourcename = AppConsts.localization.defaultLocalizationSourceName;

        let localizedText = this.localize(key, sourcename);
        if (!localizedText || localizedText == key) {
            let fullKey = sourcename + '.' + key;
            localizedText = this.translate.instant(fullKey);
            if (localizedText == fullKey)
                localizedText = key;
        }

        if (args && args.length) {
            args.unshift(localizedText);
            return abp.utils.formatString.apply(this, args);
        } else
            return localizedText;
    }

    lr(key: string) {
        return this.l(key) + '*';
    }
}