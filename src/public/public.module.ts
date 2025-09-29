import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { HomeComponent } from './home/home.component';
import { PublicRoutingModule } from './public-routing.module';
import { MemberPortalComponent } from './portal/member.portal.component';
import { ReferralSettingsDialogComponent } from './portal/referral-settings-dialog/referral-settings-dialog.component';
import { SubscriptionManagementDialogComponent } from './portal/subscription-management-dialog/subscription-management-dialog.component';
import { LucideAngularModule, CheckCircle, Sun, Moon, Users, Check, FileText, Calendar, Headphones, Download, Receipt, Mail, Link, Copy, CalendarPlus, MapPin, ExternalLink, Clock, Globe, Send, ChevronDown, User, Share, Settings, Crown, MoreHorizontal, Upload, X, LogOut, AlertTriangle, Gift, CreditCard, Sparkles, File, Locate, Lock, ListChecks, Camera, HelpCircle} from 'lucide-angular';
import { ServiceProxyModule } from '@shared/service-proxies/service-proxy.module';
import { API_BASE_URL } from '@shared/service-proxies/service-proxies';
import { AppConsts } from '@shared/AppConsts';
import { CommonModule as SharedCommonModule } from '@shared/common/common.module';
import { ClipboardModule } from 'ngx-clipboard';
import { LayoutCommonModule } from '@app/shared/layout/layout-common.module';
import { AppCommonModule } from '@app/shared/common/app-common.module';
import { DialogService } from '@app/shared/common/dialogs/dialog.service';
import { DxScrollViewModule } from 'devextreme-angular/ui/scroll-view';
import { DxTooltipModule } from 'devextreme-angular/ui/tooltip';
import { DxSelectBoxModule } from 'devextreme-angular/ui/select-box';
import { DxTextBoxModule } from 'devextreme-angular/ui/text-box';
import { InplaceEditModule } from '@app/shared/common/inplace-edit/inplace-edit.module';
import { ReferralService } from '@shared/common/referral/referral.service';
import { ProfileService } from '@shared/common/profile-service/profile.service';
import { SharingService } from '@shared/common/sharing-service/sharing.service';
import { LifecycleSubjectsService } from '@shared/common/lifecycle-subjects/lifecycle-subjects.service';
import { UserCommissionServiceProxy, AffiliateLinkServiceProxy, AffiliatePayoutSettingServiceProxy } from '@shared/service-proxies/service-proxies';
import { AppAuthService } from '@shared/common/auth/app-auth.service';
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
      LayoutCommonModule,
      AppCommonModule,
      DxScrollViewModule,
      DxTooltipModule,
      DxSelectBoxModule,
      DxTextBoxModule,
      InplaceEditModule,
      LucideAngularModule.pick({ CheckCircle, Sun, Moon, Users,Check, FileText, Calendar, Headphones, Download, Receipt, Mail, Link, Copy, CalendarPlus, MapPin,  ExternalLink, Clock, Globe, Send, ChevronDown, User, Share, Settings, Crown, MoreHorizontal, Upload, X, LogOut, AlertTriangle, Gift, CreditCard, Sparkles, File, Locate, Lock, ListChecks, Camera, HelpCircle })
  ],
  providers: [
    { provide: API_BASE_URL, useValue: AppConsts.remoteServiceBaseUrl },
    DialogService,
    ReferralService,
    ProfileService,
    SharingService,
    LifecycleSubjectsService,
    UserCommissionServiceProxy,
    AffiliateLinkServiceProxy,
    AffiliatePayoutSettingServiceProxy,
    AppAuthService
  ]
})
export class PublicModule { }
