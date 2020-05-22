/** Core imports */
import { Injectable } from '@angular/core';
import {
    CanActivate, Router,
    ActivatedRouteSnapshot,
    RouterStateSnapshot,
    CanActivateChild
} from '@angular/router';

/** Application imports */
import { AppPermissionService } from '@shared/common/auth/permission.service';
import { AppSessionService } from '@shared/common/session/app-session.service';
import { UrlHelper } from '@shared/helpers/UrlHelper';
import { FeatureCheckerService } from '@abp/features/feature-checker.service';

@Injectable()
export class RouteGuard implements CanActivate, CanActivateChild {

    constructor(
        private feature: FeatureCheckerService,
        private permissionChecker: AppPermissionService,
        private router: Router,
        private sessionService: AppSessionService
    ) {}

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        let stateUrl = state && state.url.split('?').shift(), isStateRoot = stateUrl == '/';
        if (state && (UrlHelper.isInstallUrl(stateUrl) || UrlHelper.isAccountModuleUrl(stateUrl) || UrlHelper.isPublicUrl(stateUrl))) {
            return true;
        }

        if (!this.sessionService.user) {
            let tenant = this.sessionService.tenant,
                uri = '/account/login';
            if (abp.session.impersonatorTenantId) {
                location.pathname = uri;
                location.search = '';
            } else
                this.router.navigate([uri]);
            return false;
        }

        if ((!route.data || (!route.data['permission'] && !route.data['feature'])) && !isStateRoot) {
            return true;
        }

        if ((!route.data['permission'] || this.permissionChecker.isGranted(route.data['permission']))
            && (!route.data['feature'] || this.feature.isEnabled(route.data['feature'])) && !isStateRoot
        ) {
            return true;
        }

        if ((route.data && route.data['permission'] && route.data['permission'] === 'Detect.Route') || isStateRoot)
            this.router.navigate([this.selectBestRoute()]);
        else
            this.router.navigate(['/app/access-denied']);

        return false;
    }

    canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        return this.canActivate(route, state);
    }

    selectBestRoute(): string {
        return (abp.session.multiTenancySide == abp.multiTenancy.sides.TENANT ?
            this.getBestRouteForTenant() : this.getBestRouteForHost()) || '/app/access-denied';
    }

    getBestRouteForTenant(preferedModule = null): string {
        let tenant = this.sessionService.tenant,
            user = this.sessionService.user;

        return '/app/dashboard';
    }

    getBestRouteForHost(): string {
        return null;
    }
}