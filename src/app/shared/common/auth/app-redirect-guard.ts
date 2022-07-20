/** Core imports */
import { Injectable } from '@angular/core';
import {
    CanActivate, Router,CanActivateChild,ActivatedRoute,
    RouterStateSnapshot, ActivatedRouteSnapshot
} from '@angular/router';

/** Application imports */
import { AppFeatures } from '@root/shared/AppFeatures';
import { FeatureCheckerService } from 'abp-ng2-module';

@Injectable()
export class AppRedirectGuard implements CanActivate {

  constructor(
    private router: Router,
    private feature: FeatureCheckerService
  ) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    var navigatePath = '';
    if (this.feature.isEnabled(AppFeatures.PortalDashboard))
        navigatePath = '/app/dashboard';
    else if (this.feature.isEnabled(AppFeatures.PortalInvoices))   
        navigatePath = '/app/invoices';
    else if (this.feature.isEnabled(AppFeatures.PortalLeads))   
        navigatePath = '/app/leads';
    else if (this.feature.isEnabled(AppFeatures.PortalReseller))   
        navigatePath = '/app/reseller-info';
    else
        navigatePath = '/app/dashboard';
    
    this.router.navigate([navigatePath]);
    return false;
  }
}