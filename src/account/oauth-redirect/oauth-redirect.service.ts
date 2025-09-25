import { Injectable } from '@angular/core';

import {
} from '@root/shared/service-proxies/service-proxies';
import { AppConsts } from '@shared/AppConsts';

@Injectable()
export class OAuthPopupService {
    private oAuthPopup: Window;

    constructor(
    ) { }

    discordOAuth(discordAppId: string, tenantId: number, includeGuilds: boolean, callback: (code: string, redirectUrl: string) => void) {
        let scopes = ['email', 'identify'];
        if (includeGuilds)
            scopes.push('guilds');
        let scopesString = scopes.join('%20');
        let redirectUrl = `${AppConsts.appConfigOrigin.remoteServiceBaseUrl}/account/oauth-redirect?provider=discord`;
        let popupUrl = 'https://discord.com/oauth2/authorize?response_type=code&client_id=' + discordAppId +
            `&redirect_uri=${redirectUrl}&state=${tenantId}&scope=${scopesString}&prompt=none`;

        this.oAuthPopup = window.open(popupUrl, 'discordOAuth', 'width=500,height=600');
        if (!this.oAuthPopup) {
            abp.notify.error('Please allow popups to authorize in Discord');
            return;
        }

        const popupCheckInterval = setInterval(() => {
            if (this.oAuthPopup.closed) {
                this.oAuthPopup = null;
                clearInterval(popupCheckInterval);
                window.removeEventListener('message', messageHandler);
            }
        }, 500);

        const messageHandler = (event: MessageEvent) => {
            if (event.origin !== AppConsts.appConfigOrigin.remoteServiceBaseUrl)
                return;

            if (event.data.code) {
                const authCode = event.data.code;
                callback(authCode, redirectUrl);
            } else {
                abp.notify.error(event.data.error || 'Failed to get ');
            }

            clearInterval(popupCheckInterval);
            window.removeEventListener('message', messageHandler);
            this.oAuthPopup.close();
            this.oAuthPopup = null;
        };

        window.addEventListener('message', messageHandler);
    }

    //openOAuthPopup(config: any): Observable<any> {
    //    return new Observable(observer => {
    //        const scopesString = encodeURIComponent(config.scopes.join(' '));

    //        let popupUrl = `${config.authUrl}?response_type=code` +
    //            `&client_id=${encodeURIComponent(config.clientId)}` +
    //            `&redirect_uri=${encodeURIComponent(config.redirectUrl)}` +
    //            `&scope=${scopesString}`;

    //        if (config.tenantId) {
    //            popupUrl += `&state=${config.tenantId}`;
    //        }

    //        if (config.extraParams) {
    //            Object.entries(config.extraParams).forEach(([k, v]) => {
    //                popupUrl += `&${encodeURIComponent(k)}=${encodeURIComponent(v)}`;
    //            });
    //        }

    //        this.popup = window.open(popupUrl, `${config.provider}OAuth`, 'width=500,height=600');

    //        if (!this.popup) {
    //            observer.error('Please allow popups to authorize in ' + config.provider);
    //            return;
    //        }

    //        const popupCheckInterval = setInterval(() => {
    //            if (this.popup && this.popup.closed) {
    //                clearInterval(popupCheckInterval);
    //                this.popup = null;
    //                window.removeEventListener('message', messageHandler);
    //                this.ngZone.run(() => observer.error('Popup closed by user'));
    //            }
    //        }, 500);

    //        const messageHandler = (event: MessageEvent) => {
    //            if (event.origin !== new URL(config.redirectUrl).origin) return;

    //            clearInterval(popupCheckInterval);
    //            if (this.popup) {
    //                this.popup.close();
    //                this.popup = null;
    //            }
    //            window.removeEventListener('message', messageHandler);

    //            this.ngZone.run(() => {
    //                if (event.data.code) {
    //                    observer.next(event.data);
    //                    observer.complete();
    //                } else {
    //                    observer.error(event.data.error || 'OAuth failed');
    //                }
    //            });
    //        };

    //        window.addEventListener('message', messageHandler);
    //    });
    //}
}