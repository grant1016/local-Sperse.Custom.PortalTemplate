/** Core imports */
import { Injectable } from '@angular/core';
import {
    CanActivate, Router,CanActivateChild,ActivatedRoute,
    RouterStateSnapshot, ActivatedRouteSnapshot
} from '@angular/router';

/** Application imports */
import { AppFeatures } from '@root/shared/AppFeatures';
import { FeatureCheckerService } from 'abp-ng2-module';
import { AppPermissionService } from '@shared/common/auth/permission.service';
import { AppPermissions } from '@shared/AppPermissions';

@Injectable()
export class AppRedirectGuard implements CanActivate {

  constructor(
    private router: Router,
    private feature: FeatureCheckerService,
    private permission: AppPermissionService
  ) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    let navigatePath = '',
        isGrantedCRMGroup = this.permission.isGranted(AppPermissions.CRMCustomers)
            || this.permission.isGranted(AppPermissions.CRMPartners)
            || this.permission.isGranted(AppPermissions.CRMEmployees)
            || this.permission.isGranted(AppPermissions.CRMInvestors)
            || this.permission.isGranted(AppPermissions.CRMVendors)
            || this.permission.isGranted(AppPermissions.CRMOthers);
    if (this.feature.isEnabled(AppFeatures.PortalDashboard) && 
        this.permission.isGranted(AppPermissions.CRMCustomers)
    ) navigatePath = '/app/dashboard';
    else if (this.feature.isEnabled(AppFeatures.PortalLeads) && isGrantedCRMGroup) 
        navigatePath = '/app/leads';
    else if (this.feature.isEnabled(AppFeatures.PortalInvoices))   
        navigatePath = '/app/invoices';
    else if (this.feature.isEnabled(AppFeatures.PortalReseller))   
        navigatePath = '/app/reseller-info';
    else
        navigatePath = '/app/dashboard';
    
    this.router.navigate([navigatePath]);
    return false;
  }
}