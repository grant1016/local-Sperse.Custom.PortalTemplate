import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { HomeComponent } from './home/home.component';
import { PublicRoutingModule } from './public-routing.module';
import { MemberPortalComponent } from './portal/member.portal.component';
import { ReferralSettingsDialogComponent } from './portal/referral-settings-dialog/referral-settings-dialog.component';
import { SubscriptionManagementDialogComponent } from './portal/subscription-management-dialog/subscription-management-dialog.component';
import { LucideAngularModule, CheckCircle, Sun, Moon, Users, Check, FileText, Calendar, Headphones, Download, Receipt, Mail, Link, Copy, CalendarPlus, MapPin, ExternalLink, Clock, Globe, Send, ChevronDown, User, Share, Settings, Crown, MoreHorizontal, Upload, X, LogOut, AlertTriangle, Gift, CreditCard, Sparkles} from 'lucide-angular';
import { ServiceProxyModule } from '@shared/service-proxies/service-proxy.module';
import { API_BASE_URL } from '@shared/service-proxies/service-proxies';
import { AppConsts } from '@shared/AppConsts';
import { CommonModule as SharedCommonModule } from '@shared/common/common.module';
import { ClipboardModule } from 'ngx-clipboard';


@NgModule({
  declarations: [
      HomeComponent,
      MemberPortalComponent,
      ReferralSettingsDialogComponent,
      SubscriptionManagementDialogComponent
    ],
    imports: [
      CommonModule,
      HttpClientModule,
      PublicRoutingModule,
      ServiceProxyModule,
      SharedCommonModule,
      ClipboardModule,
      LucideAngularModule.pick({ CheckCircle, Sun, Moon, Users,Check, FileText, Calendar, Headphones, Download, Receipt, Mail, Link, Copy, CalendarPlus, MapPin,  ExternalLink, Clock, Globe, Send, ChevronDown, User, Share, Settings, Crown, MoreHorizontal, Upload, X, LogOut, AlertTriangle, Gift, CreditCard, Sparkles })
  ],
  providers: [
    { provide: API_BASE_URL, useValue: AppConsts.remoteServiceBaseUrl }
  ]
})
export class PublicModule { }
