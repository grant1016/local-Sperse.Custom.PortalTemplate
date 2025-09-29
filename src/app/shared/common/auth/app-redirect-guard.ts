/** Core imports */
import { Injectable } from '@angular/core';
import {
    CanActivate, Router,CanActivateChild,ActivatedRoute,
    RouterStateSnapshot, ActivatedRouteSnapshot
} from '@angular/router';

/** Application imports */
import { AppFeatures } from '@root/shared/AppFeatures';
import { FeatureCheckerService, SettingService } from 'abp-ng2-module';
import { AppPermissionService } from '@shared/common/auth/permission.service';
import { AppPermissions } from '@shared/AppPermissions';
import { ConfigNavigation } from '../config-navigation.interface';
import { PortalMenuItemConfig } from '@app/shared/layout/user-menu/dto/portal-menu-item';

@Injectable()
export class AppRedirectGuard implements CanActivate {

  constructor(
    private router: Router,
    private feature: FeatureCheckerService,
    private permission: AppPermissionService,
    private setting: SettingService
  ) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    let navigatePath = '',
        isGrantedCRMGroup = this.permission.isGranted(AppPermissions.CRMCustomers)
            || this.permission.isGranted(AppPermissions.CRMPartners)
            || this.permission.isGranted(AppPermissions.CRMEmployees)
            || this.permission.isGranted(AppPermissions.CRMInvestors)
            || this.permission.isGranted(AppPermissions.CRMVendors)
            || this.permission.isGranted(AppPermissions.CRMOthers);
    let menuCustomization = this.getMenuConfig();
        
    if (this.feature.isEnabled(AppFeatures.PortalDashboard) && 
        this.permission.isGranted(AppPermissions.CRMCustomers) && this.isVisible(menuCustomization, 'Dashboard')
    ) navigatePath = '/app/dashboard';
    else if (this.feature.isEnabled(AppFeatures.PortalLeads) && isGrantedCRMGroup && this.isVisible(menuCustomization, 'ReferredLeads')) 
        navigatePath = '/app/leads';
    else if (this.feature.isEnabled(AppFeatures.PortalInvoices) && this.isVisible(menuCustomization, 'MyInvoices'))   
        navigatePath = '/app/invoices';
    else if (this.feature.isEnabled(AppFeatures.PortalReseller) && this.isVisible(menuCustomization, 'MyReferralPortal'))   
        navigatePath = '/app/reseller-info';
    else
        navigatePath = '/app/home';
    
    this.router.navigate([navigatePath]);
    return false;
  }

  getMenuConfig(): PortalMenuItemConfig[] {
    let cutomizationJson = this.setting.get('App.Appearance.Portal.MenuCustomization');
    return cutomizationJson ? JSON.parse(cutomizationJson) : null;
  }

  isVisible(config: PortalMenuItemConfig[], target: string): boolean {
    if (!config)
        return true;

    let item = config.find(v => v.code == target);
    return !item || !item.hide;
  }
}