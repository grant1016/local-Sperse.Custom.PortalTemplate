/** Core imports */
/** Core imports */
import { Component, HostListener, OnInit, OnDestroy, ViewEncapsulation, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import {
    GetInvoiceReceiptInfoOutput, InvoiceEventInfo, InvoiceStatus,
    UserInvoiceServiceProxy,
    TenantHostServiceProxy,
    GetExternalUserDataInput,
    ExternalUserDataServiceProxy,
    GetExternalUserDataOutput,
    SetDiscordForContactInput,
    UserSubscriptionServiceProxy,
    OrderSubscriptionDto
} from '@root/shared/service-proxies/service-proxies';
import { CheckCircle, Send } from 'lucide-angular';

/** Third party imports */
import { ClipboardService } from 'ngx-clipboard';
import * as moment from 'moment';
import { findIana } from 'windows-iana';
import { MatDialog } from '@angular/material/dialog';

/** Application imports */
import { ConditionsType } from '@shared/AppEnums';
import { AppLocalizationService } from '@app/shared/common/localization/app-localization.service';
import { ConditionsModalService } from '@shared/common/conditions-modal/conditions-modal.service';
import { AppConsts } from '@shared/AppConsts';
import { finalize } from 'rxjs/operators';
import { ReferralSettingsDialogComponent } from './referral-settings-dialog/referral-settings-dialog.component';
import { EventDurationHelper } from '@shared/crm/helpers/event-duration-types.enum';
import { SubscriptionManagementDialogComponent } from './subscription-management-dialog/subscription-management-dialog.component';
import { MySettingsModalComponent } from '@app/shared/layout/profile/my-settings-modal.component';
import { UploadPhotoDialogComponent } from '@app/shared/common/upload-photo-dialog/upload-photo-dialog.component';
import { ProfileService } from '@shared/common/profile-service/profile.service';
import { AppSessionService } from '@shared/common/session/app-session.service';
import { AppAuthService } from '@shared/common/auth/app-auth.service';
import { ChangePasswordModalComponent } from '@app/shared/layout/profile/change-password-modal.component';
import { LoginAttemptsModalComponent } from '@app/shared/layout/login-attempts-modal/login-attempts-modal.component';
import { ProfileServiceProxy, UpdateProfilePictureInput } from '@shared/service-proxies/service-proxies';
import { StringHelper } from '@shared/helpers/StringHelper';
import { filter, switchMap, tap } from 'rxjs/operators';
import { of } from 'rxjs';
@Component({
    selector: 'public-portal',
    templateUrl: 'member.portal.component.html',
    styleUrls: [
        // '../../../shared/common/styles/core.less',
        './member.portal.component.less',
        '../../shared/common/styles/dx-customs.less',
    ],
    encapsulation: ViewEncapsulation.None,
})
export class MemberPortalComponent implements OnInit, OnDestroy {
    loading: boolean = true;
    invoiceInfo: GetInvoiceReceiptInfoOutput;
    returnText: string = '';
    hostName = AppConsts.defaultTenantName;
    currentYear: number = new Date().getFullYear();
    hasToSOrPolicy: boolean;
    conditions = ConditionsType;
    remoteServiceBaseUrl: string = AppConsts.remoteServiceBaseUrl;
    
    // Subscription data
    subscriptionHistory: OrderSubscriptionDto[] = [];
    currentSubscription: OrderSubscriptionDto | null = null;
    subscriptionLoading: boolean = false;
    private tailwindScript: HTMLScriptElement;
    helpLink = abp.setting.values['Integrations:Zendesk:AccountUrl'] ? location.protocol + '//' + abp.setting.values['Integrations:Zendesk:AccountUrl'] : null;

    static retryDelay: number = 4000;
    static maxRetryCount: number = 15;
    currentRetryCount: number = 0;
    failedToLoad: boolean = false;
    failMessage: string = '';

    tenantId: number = Number(this.activatedRoute.snapshot.paramMap.get('tenantId'));
    publicId = this.activatedRoute.snapshot.paramMap.get('publicId');
    preventRedirect: boolean = Boolean(this.activatedRoute.snapshot.queryParamMap.get('preventRedirect'));
    usePortal = !!this.activatedRoute.snapshot.queryParamMap.get('usePortal');
    isTestMode: boolean = this.activatedRoute.snapshot.url[0]?.path === 'member-portal';
    tenantLogo: string = '';
    discordPopup: Window;
    discordUserId: string;
    discordUserName: string;
    discordUserUpdated: boolean;
    discordUserUpdating: boolean;
    telegramUserId: string;
    telegramUserName: string;
    telegramUserUpdated: boolean;
    telegramUserUpdating: boolean;
    shownLoginInfo: any;
    // Theme switching
    currentTheme: 'original' | 'modern' = 'modern';

    // Dark mode for receipt page only
    isDarkMode: boolean = false;

    // Calendar dropdown
    showCalendarDropdown: boolean = false;
    selectedEvent: any = null;
    private documentClickHandler: (event: Event) => void;

    // Profile dropdown
    showProfileDropdown: boolean = false;
    private profileDocumentClickHandler: (event: Event) => void;

    // Modern theme properties
    showConfetti: boolean = false;
    confettiPieces: any[] = [];
    defaultBenefits: any[] = [
        {
            icon: 'Users',
            title: 'Private Discord Channels',
            description: 'Access exclusive member-only channels and community discussions'
        },
        {
            icon: 'FileText',
            title: 'Premium Content & Files',
            description: 'Download exclusive resources, guides, and member materials'
        },
        {
            icon: 'Calendar',
            title: 'Member Events',
            description: 'Join live sessions, workshops, and community events'
        },
        {
            icon: 'Headphones',
            title: 'Priority Support',
            description: 'Get faster responses and dedicated member support'
        }
    ];

    constructor(
        @Inject(DOCUMENT) private document: Document,
        private router: Router,
        private activatedRoute: ActivatedRoute,
        public ls: AppLocalizationService,
        private userInvoiceService: UserInvoiceServiceProxy,
        private tenantHostService: TenantHostServiceProxy,
        private clipboardService: ClipboardService,
        private externalUserDataService: ExternalUserDataServiceProxy,
        public conditionsModalService: ConditionsModalService,
        private dialog: MatDialog,
        private profileService: ProfileService,
        private appSessionService: AppSessionService,
        private profileServiceProxy: ProfileServiceProxy,
        private authService: AppAuthService,
        private userSubscriptionService: UserSubscriptionServiceProxy,
    ) {
        // Bind the document click handler once in constructor
        this.documentClickHandler = this.onDocumentClick.bind(this);
        this.profileDocumentClickHandler = this.onProfileDocumentClick.bind(this);
    }

    ngOnInit(): void {
        this.loadTailwindCSS();
        this.clearQueryParam();
        this.initializeConfetti();
        this.isDarkMode = localStorage.getItem('isDarkMode') === 'true';
        abp.ui.setBusy();

        
        
        // Load subscription history
        this.getSubscriptionHistory();
        console.log('Tenant ID:', this.appSessionService.tenantId);
        
        if (this.isTestMode) {
            this.loadTestData();
        } else {
            this.getInvoiceInfo(this.appSessionService.tenantId, this.publicId);
        }
    }

    initializeConfetti() {
        // Create confetti pieces for animation
        this.confettiPieces = [];
        const colors = ['#FFC107', '#E91E63', '#2196F3', '#4CAF50', '#FF9800', '#9C27B0'];

        for (let i = 0; i < 50; i++) {
            this.confettiPieces.push({
                left: Math.random() * 100,
                delay: Math.random() * 3,
                color: colors[Math.floor(Math.random() * colors.length)]
            });
        }

        // Show confetti on load
        setTimeout(() => {
            this.showConfetti = true;
            setTimeout(() => {
                this.showConfetti = false;
            }, 3000);
        }, 500);
    }

    clearQueryParam() {
        this.router.navigate([], {
            queryParams: {
                'usePortal': null
            },
            queryParamsHandling: 'merge'
        });
    }


    loadTestData() {
        // Mock data for testing the thank you page - matching the screenshot
        this.invoiceInfo = {
            invoiceStatus: 'Paid' as any,
            invoiceAmount: 594.00,
            currencyId: 'USD',
            invoiceNumber: 'MEXIJQDE-0001',
            paymentDate: new Date('2025-09-19'),
            paymentCardNumber: '****4242',
            paymentCardNetwork: 'visa',
            downloadInvoiceUrl: '#',
            downloadReceiptUrl: '#',
            tenantLogo: 'assets/common/images/logo.png',
            tenantHasTerms: true,
            tenantHasPrivacyPolicy: true,
            isTenantInvoice: true,
            redirectUrls: [],
            resources: [
                {
                    id: 1,
                    name: 'Trading Strategy Guide',
                    url: 'https://example.com/strategy-guide.pdf',
                    type: 'pdf'
                },
                {
                    id: 2,
                    name: 'Market Analysis Template',
                    url: 'https://example.com/analysis-template.xlsx',
                    type: 'excel'
                }
            ],
            events: [
                {
                    productName: 'Advanced Trading Masterclass',
                    location: 'Online',
                    date: new Date('2024-12-15'),
                    time: '14:00',
                    timezone: 'US Mountain Standard Time',
                    durationMinutes: 120,
                    languageName: 'English',
                    link: 'https://example.com/join-event',
                    address: {
                        streetAddress: '',
                        city: '',
                        stateName: '',
                        countryName: '',
                        zip: ''
                    }
                }
            ],
            discordInfo: {
                showDiscordAuthButton: true,
                discordAppId: 'test-app-id'
            },
            // Additional data for modern theme
            membershipBenefits: [
                {
                    title: 'Private Discord Channels',
                    description: 'Access exclusive member-only channels and community discussions.',
                    icon: 'discord'
                },
                {
                    title: 'Premium Content & Files',
                    description: 'Download exclusive resources, guides, and member materials.',
                    icon: 'download'
                },
                {
                    title: 'Member Events',
                    description: 'Join live sessions, workshops, and community events.',
                    icon: 'calendar'
                },
                {
                    title: 'Priority Support',
                    description: 'Get faster responses and dedicated member support.',
                    icon: 'support'
                }
            ],
            externalResources: [
                {
                    title: 'Premium Trading Tools',
                    description: 'Access to advanced charting and analysis tools.',
                    link: 'https://example.com/trading-tools',
                    platform: 'Web Platform'
                },
                {
                    title: 'Member Resource Library',
                    description: 'Exclusive collection of trading resources and guides.',
                    link: 'https://example.com/resource-library',
                    platform: 'Resource Portal'
                },
                {
                    title: 'Community Forum',
                    description: 'Connect with other members and share insights',
                    link: 'https://example.com/community-forum',
                    platform: 'Discussion Forum'
                }
            ],
            telegramInfo: {
                showTelegramAuth: true,
                authorizedUser: null,
                userId: null
            }
        } as any;

        this.hasToSOrPolicy = this.invoiceInfo.tenantHasTerms || this.invoiceInfo.tenantHasPrivacyPolicy;
        this.initEventsInfo();
        this.setReturnLinkInfo();
        this.loading = false;
        abp.ui.clearBusy();
    }

    switchTheme(theme: 'original' | 'modern') {
        this.currentTheme = theme;
    }

    getInvoiceInfo(tenantId, publicId) {
        this.userInvoiceService
            .getInvoiceReceiptInfo(tenantId, publicId)
            .subscribe(result => {
                this.tenantLogo = result.tenantLogo;
                switch (result.invoiceStatus) {
                    case InvoiceStatus.Sent:
                        {
                            if (result.waitingForFutureSubscriptionPayment) {
                                this.router.navigate(['invoicing/invoice', tenantId, publicId]);
                                return;
                            }

                            this.retryDataRequest(tenantId, publicId);
                            return;
                        }
                    case InvoiceStatus.Paid:
                        {
                            if (!this.preventRedirect && result.redirectUrls && result.redirectUrls.length == 1) {
                                location.href = result.redirectUrls[0];
                                return;
                            }

                            this.invoiceInfo = result;
                            this.invoiceInfo.resources = result.resources.sort((a, b) => Boolean(a.url) > Boolean(b.url) ? 1 : -1);
                            this.hasToSOrPolicy = this.invoiceInfo.tenantHasTerms || this.invoiceInfo.tenantHasPrivacyPolicy;
                            this.initEventsInfo();
                            this.setReturnLinkInfo();
                            this.loading = false;
                            abp.ui.clearBusy();
                            return;
                        }
                    default:
                        {
                            this.retryDataRequest(tenantId, publicId);
                            return;
                        }
                }
            });
    }

    getSubscriptionHistory() {
        this.subscriptionLoading = true;
        this.userSubscriptionService.getSubscriptionHistory()
            .pipe(finalize(() => {
                this.subscriptionLoading = false;
            }))
            .subscribe(
                (subscriptions: OrderSubscriptionDto[]) => {
                    console.log('Subscription History Data:', subscriptions);
                    this.subscriptionHistory = subscriptions;
                    // Get the current/active subscription (status "A" for Active/Current)
                    this.currentSubscription = subscriptions.find(sub => sub.statusCode === 'A') || subscriptions[0] || null;
                    console.log('Current Subscription:', this.currentSubscription);
                },
                (error) => {
                    console.error('Error fetching subscription history:', error);
                    abp.notify.error('Failed to load subscription information');
                }
            );
    }

    // Helper method to format currency and amount
    formatCurrency(amount: number, currency: string): string {
        if (!amount || !currency) return '';
        return `${amount} ${currency}`;
    }

    // Helper method to format payment period
    formatPaymentPeriod(period: string): string {
        if (!period) return 'month';
        return period.toLowerCase();
    }

    // Helper method to get subscription status color
    getSubscriptionStatusColor(statusCode: string): string {
        switch (statusCode) {
            case 'A': return 'bg-[#16a249]'; // Active/Current
            case 'C': return 'bg-[#dc2626]'; // Cancelled
            case 'E': return 'bg-[#f59e0b]'; // Expired
            default: return 'bg-[#6b7280]'; // Unknown
        }
    }

    // Helper method to get member since date
    getMemberSinceDate(): string {
        if (this.currentSubscription?.startDate) {
            return moment(this.currentSubscription.startDate).format('MMMM YYYY');
        }
        return 'September 2025';
    }

    retryDataRequest(tenantId, publicId) {
        this.currentRetryCount++;
        if (this.currentRetryCount >= MemberPortalComponent.maxRetryCount) {
            abp.ui.clearBusy();
            this.failedToLoad = true;
            this.failMessage = 'Failed to load payment information. Please refresh the page or try again later.';
        }
        else {
            setTimeout(() => this.getInvoiceInfo(tenantId, publicId), MemberPortalComponent.retryDelay);
        }
    }

    setReturnLinkInfo() {
        if (this.invoiceInfo.isTenantInvoice) {
            this.returnText = abp.session.userId ? 'Return to System' : 'Login to System';
        }
        else if (this.usePortal) {
            this.returnText = 'Return to System';
        }
    }

    returnLinkClick() {
        abp.ui.setBusy();

        if (this.usePortal) {
            this.tenantHostService.getMemberPortalUrl(this.tenantId || undefined)
                .subscribe(output => {
                    window.location.href = output.url;
                });
        }
        else if (abp.session.userId) {
            window.location.href = location.origin + '/app/crm';
        }
        else {
            sessionStorage.setItem('redirectUrl', `${location.origin}/app/crm`);
            window.location.href = location.origin + '/account/login';
        }
    }

    openConditionsDialog(type: ConditionsType) {
        this.conditionsModalService.openModal({
            panelClass: ['slider', 'footer-slider'],
            data: {
                type: type,
                tenantId: this.tenantId,
                hasOwnDocument: type == ConditionsType.Terms ? this.invoiceInfo.tenantHasTerms : this.invoiceInfo.tenantHasPrivacyPolicy
            }
        });
    }

    resourceClick(event, resource: any) {
        if (resource.url) {
            this.clipboardService.copyFromContent(resource.url);
            abp.notify.info(this.ls.l('SavedToClipboard'));
        } else {
            if (resource.fileUrl)
                window.open(resource.fileUrl, '_blank');
            else
                this.userInvoiceService.getInvoiceResourceUrl(this.tenantId, this.publicId, resource.id).subscribe(url => {
                    resource.fileUrl = url;
                    window.open(url, '_blank');
                });
        }

        event.stopPropagation();
        event.preventDefault();
    }

    initEventsInfo() {
        if (!this.invoiceInfo.events)
            return;

        for (let event of this.invoiceInfo.events) {
            if (event.time) {
                let baseDateMomentUtc = event.date ? moment(new Date(event.date)).utc() : moment().utc();
                let timeArr = event.time.split(':');
                baseDateMomentUtc.set({ hour: timeArr[0], minute: timeArr[1] });
                let timezoneDateMoment = baseDateMomentUtc.tz(findIana(event.timezone)[0]);
                event['dateStr'] = event.date ? timezoneDateMoment.format('MMM D, YYYY h:mm A Z') : timezoneDateMoment.format('h:mm A Z');
                event['dateStrLocal'] = event.date ? timezoneDateMoment.local().format('MMM D, YYYY h:mm A Z') : timezoneDateMoment.local().format('h:mm A Z');
            } else if (event.date) {
                event['dateStr'] = moment(new Date(event.date)).utc().format('MMM D, YYYY');
            }
            if (event.durationMinutes) {
                let durationInfo = EventDurationHelper.ParseDuration(event.durationMinutes);
                event['durationStr'] = `${durationInfo.eventDuration} ${EventDurationHelper.getDisplayValue(durationInfo.eventDurationType)}`;
            }

        }
    }

    copyEventData(event: InvoiceEventInfo) {
        let eventData = `${event.productName}\nLocation: ${this.ls.l('ProductEventLocation_' + event.location)}\n`;
        if (event['dateStr']) {
            eventData += `Date: ${event['dateStr']}${event.time ? '(' + event.timezone + ')' : ''}\n`;
            if (event.time)
                eventData += `Local Date: ${event['dateStrLocal']}\n`;
        }

        eventData += this.getCopyString('Link', event.link);

        if (event.address.streetAddress || event.address.city || event.address.stateName || event.address.countryName || event.address.zip) {
            eventData += `Address\n`;
            eventData += this.getCopyString('Street', event.address.streetAddress);
            eventData += this.getCopyString('City', event.address.city);
            eventData += this.getCopyString('State', event.address.stateName);
            eventData += this.getCopyString('Country', event.address.countryName);
            eventData += this.getCopyString('Zip', event.address.zip);
        }

        eventData += this.getCopyString('Duration', event['durationStr']);
        eventData += this.getCopyString('Language', event.languageName, false);

        this.clipboardService.copyFromContent(eventData);
        abp.notify.info(this.ls.l('SavedToClipboard'));
    }

    private getCopyString(displayName: string, value: any, checkNotEmpty = true): string {
        if (checkNotEmpty && !value) {
            return '';
        }
        return `${displayName}: ${value}\n`;
    }

    discordOAuth() {
        console.log("asdfasdf");

        let scopes = ['email', 'identify', 'guilds.join'];
        let scopesString = scopes.join('%20');
        let redirectUrl = `${AppConsts.appConfigOrigin.remoteServiceBaseUrl}/account/oauth-redirect?provider=discord`;
        let popupUrl = 'https://discord.com/oauth2/authorize?response_type=code&client_id=' + this.invoiceInfo.discordInfo?.discordAppId +
            `&redirect_uri=${redirectUrl}&state=${this.tenantId}&scope=${scopesString}&prompt=none`;

        this.discordPopup = window.open(popupUrl, 'discordOAuth', 'width=500,height=600');
        if (!this.discordPopup) {
            abp.notify.error('Please allow popups to authorize in Discord');
            return;
        }

        const popupCheckInterval = setInterval(() => {
            if (this.discordPopup.closed) {
                this.discordPopup = null;
                clearInterval(popupCheckInterval);
                window.removeEventListener('message', messageHandler);
            }
        }, 500);

        const messageHandler = (event: MessageEvent) => {
            if (event.origin !== AppConsts.appConfigOrigin.remoteServiceBaseUrl)
                return;

            if (event.data.code) {
                const authCode = event.data.code;
                this.externalUserDataService.getUserData(new GetExternalUserDataInput({
                    tenantId: 0,
                    provider: 'Discord',
                    exchangeCode: authCode,
                    loginReturnUrl: redirectUrl,
                    options: null,
                    vault: true
                })).subscribe(res => {
                    this.discordUserId = res.additionalData["Id"];
                    this.discordUserName = res.additionalData["Username"];
                });
            } else {
                abp.notify.error(event.data.error || 'Failed to get ');
            }

            clearInterval(popupCheckInterval);
            window.removeEventListener('message', messageHandler);
            this.discordPopup.close();
            this.discordPopup = null;
        };

        window.addEventListener('message', messageHandler);
    }

    confirmDiscord() {
        if (!this.discordUserId)
            return;

        this.discordUserUpdating = true;
        this.userInvoiceService.setDiscordForContact(new SetDiscordForContactInput({
            tenantId: this.tenantId,
            publicId: this.publicId,
            discordUserId: this.discordUserId,
            discordUserName: this.discordUserName
        })).pipe(finalize(() => {
            this.discordUserUpdating = false;
        })).subscribe(() => {
            this.discordUserUpdated = true;
        });
    }

    disconnectDiscord() {
        this.discordUserId = null;
        this.discordUserName = null;
        this.discordUserUpdated = false;
    }

    disconnectTelegram() {
        this.telegramUserId = null;
        this.telegramUserName = null;
        this.telegramUserUpdated = false;
    }

    addToCalendar(event: any) {
        // Create calendar event data
        const startDate = new Date(event.date);
        if (event.time) {
            const timeArr = event.time.split(':');
            startDate.setHours(parseInt(timeArr[0]), parseInt(timeArr[1]));
        }

        const endDate = new Date(startDate.getTime() + (event.durationMinutes || 60) * 60000);

        const calendarData = {
            title: event.productName,
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            location: event.location,
            description: `${event.productName} - ${event.isOnline ? 'Online Event' : event.location}`
        };

        // Copy to clipboard for now (can be enhanced with actual calendar integration)
        const calendarText = `${calendarData.title}\nStart: ${startDate.toLocaleString()}\nEnd: ${endDate.toLocaleString()}\nLocation: ${calendarData.location}`;
        this.clipboardService.copyFromContent(calendarText);
        abp.notify.info('Event details copied to clipboard');
    }

    openExternalResource(url: string) {
        window.open(url, '_blank');
    }

    downloadInvoice() {
        if (this.invoiceInfo.downloadInvoiceUrl) {
            window.open(this.invoiceInfo.downloadInvoiceUrl, '_blank');
        }
    }

    downloadReceipt() {
        if (this.invoiceInfo.downloadReceiptUrl) {
            window.open(this.invoiceInfo.downloadReceiptUrl, '_blank');
        }
    }

    @HostListener('window:beforeunload', ['$event'])
    unloadNotification($event: any) {
        if (this.invoiceInfo.discordInfo?.showDiscordAuthButton && !this.discordUserUpdated) {
            $event.returnValue = true;
            if (!this.discordUserId)
                return 'Please connect your Discord account';
            else
                return 'Please confirm your Discord account';
        }
    }

    // Dark mode toggle for receipt page only
    toggleDarkMode() {
        this.isDarkMode = !this.isDarkMode;
        localStorage.setItem('isDarkMode', this.isDarkMode.toString());
    }

    // Calendar dropdown methods
    toggleCalendarDropdown(event: any) {
        this.selectedEvent = event;
        this.showCalendarDropdown = !this.showCalendarDropdown;

        // Add click listener to document when dropdown opens
        if (this.showCalendarDropdown) {
            setTimeout(() => {
                document.addEventListener('click', this.documentClickHandler);
            }, 0);
        } else {
            // Remove listener when closing
            document.removeEventListener('click', this.documentClickHandler);
        }
    }

    closeCalendarDropdown() {
        this.showCalendarDropdown = false;
        this.selectedEvent = null;
        // Remove click listener when dropdown closes
        document.removeEventListener('click', this.documentClickHandler);
    }

    onDocumentClick(event: Event) {
        // Check if click is outside the dropdown
        const target = event.target as HTMLElement;
        const dropdown = document.querySelector('.calendar-dropdown');

        if (dropdown && !dropdown.contains(target)) {
            this.closeCalendarDropdown();
        }
    }

    addToGoogleCalendar(event: any) {
        // Google Calendar URL format
        const startDate = new Date(event.dateStr).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        const endDate = new Date(new Date(event.dateStr).getTime() + 60 * 60 * 1000).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

        const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.productName)}&dates=${startDate}/${endDate}&details=${encodeURIComponent(event.description || '')}&location=${encodeURIComponent(event.location || '')}`;
        window.open(googleUrl, '_blank');
        this.closeCalendarDropdown();
    }

    addToOutlookCalendar(event: any) {
        // Outlook Calendar URL format
        const startDate = new Date(event.dateStr).toISOString();
        const endDate = new Date(new Date(event.dateStr).getTime() + 60 * 60 * 1000).toISOString();

        const outlookUrl = `https://outlook.live.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(event.productName)}&startdt=${startDate}&enddt=${endDate}&body=${encodeURIComponent(event.description || '')}&location=${encodeURIComponent(event.location || '')}`;
        window.open(outlookUrl, '_blank');
        this.closeCalendarDropdown();
    }

    addToYahooCalendar(event: any) {
        // Yahoo Calendar URL format
        const startDate = new Date(event.dateStr).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        const endDate = new Date(new Date(event.dateStr).getTime() + 60 * 60 * 1000).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

        const yahooUrl = `https://calendar.yahoo.com/?v=60&view=d&type=20&title=${encodeURIComponent(event.productName)}&st=${startDate}&et=${endDate}&desc=${encodeURIComponent(event.description || '')}&in_loc=${encodeURIComponent(event.location || '')}`;
        window.open(yahooUrl, '_blank');
        this.closeCalendarDropdown();
    }

    downloadICSFile(event: any) {
        // Generate ICS file content
        const startDate = new Date(event.dateStr).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        const endDate = new Date(new Date(event.dateStr).getTime() + 60 * 60 * 1000).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

        const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Your Company//Event//EN
BEGIN:VEVENT
UID:${Date.now()}@yourcompany.com
DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTSTART:${startDate}
DTEND:${endDate}
SUMMARY:${event.productName}
DESCRIPTION:${event.description || ''}
LOCATION:${event.location || ''}
END:VEVENT
END:VCALENDAR`;

        // Create and download the file
        const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${event.productName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.ics`;
        link.click();

        this.closeCalendarDropdown();
    }



    openReferralSettingsDialog() {
        const dialogRef = this.dialog.open(ReferralSettingsDialogComponent, {
            maxWidth: '42rem',
            panelClass: 'referral-settings-dialog-panel',
            data: {
                isDarkMode: this.isDarkMode
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            // Handle dialog close if needed
        });
    }

    openSubscriptionManagementDialog() {
        const dialogRef = this.dialog.open(SubscriptionManagementDialogComponent, {
            maxWidth: '500px',
            width: '100%',
            panelClass: 'subscription-management-dialog-panel',
            data: {
                isDarkMode: this.isDarkMode,
                currentSubscription: this.currentSubscription
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            // Refresh subscription data if needed
            if (result && result.refreshSubscription) {
                this.getSubscriptionHistory();
            }
        });
    }

    // Profile dropdown methods
    toggleProfileDropdown() {
        this.showProfileDropdown = !this.showProfileDropdown;

        // Add click listener to document when dropdown opens
        if (this.showProfileDropdown) {
            setTimeout(() => {
                document.addEventListener('click', this.profileDocumentClickHandler);
            }, 0);
        } else {
            // Remove listener when closing
            document.removeEventListener('click', this.profileDocumentClickHandler);
        }
    }

    closeProfileDropdown() {
        this.showProfileDropdown = false;
        // Remove click listener when dropdown closes
        document.removeEventListener('click', this.profileDocumentClickHandler);
    }

    onProfileDocumentClick(event: Event) {
        // Check if click is outside the dropdown
        const target = event.target as HTMLElement;
        const dropdown = document.querySelector('.profile-dropdown');

        if (dropdown && !dropdown.contains(target)) {
            this.closeProfileDropdown();
        }
    }



    openProfileSettings() {
        this.closeProfileDropdown();
        this.dialog.open(MySettingsModalComponent, {
            panelClass: ['slider', 'user-info'],
            disableClose: true,
            closeOnNavigation: false,
            data: {}
        });
    }

    openChangeProfilePhoto() {
        this.closeProfileDropdown();
        const dialogRef = this.dialog.open(UploadPhotoDialogComponent, {
            data: {
                source: this.profileService.getProfilePictureUrl(this.appSessionService.user.profilePictureId),
                maxSizeBytes: AppConsts.maxImageSize,
                title: this.ls.l('ChangeProfilePicture')
            },
            maxWidth: AppConsts.maxImageDialogWidth,
            hasBackdrop: true
        });

        dialogRef.afterClosed()
            .pipe(
                filter(result => result),
                switchMap((result: any) => {
                    if (result.clearPhoto) {
                        return this.profileServiceProxy.clearProfilePicture().pipe(
                            tap(() => {
                                this.appSessionService.user.profilePictureId = null;
                                abp.notify.success(this.ls.l('ProfilePictureClearedSuccessfully'));
                            })
                        );
                    } else {
                        const base64OrigImage = StringHelper.getBase64(result.origImage);
                        const base64ThumbImage = StringHelper.getBase64(result.thumbImage);
                        
                        return this.profileServiceProxy.updateProfilePicture(UpdateProfilePictureInput.fromJS({
                            originalImage: base64OrigImage,
                            thumbnail: base64ThumbImage,
                            source: result.source,
                            userId: this.appSessionService.user.id,
                            useGravatarProfilePicture: false
                        })).pipe(
                            tap((newProfilePictureId: string) => {
                                this.appSessionService.user.profilePictureId = newProfilePictureId;
                                abp.notify.success(this.ls.l('ProfilePictureChangedSuccessfully'));
                            })
                        );
                    }
                })
            )
            .subscribe(
                () => {
                    // Profile picture updated successfully
                },
                (error) => {
                    abp.notify.error(this.ls.l('AnErrorOccurredWhileUpdatingProfilePicture'));
                    console.error('Error updating profile picture:', error);
                }
            );
    }

    
    openChangePassword() {
        this.closeProfileDropdown();
        this.dialog.open(ChangePasswordModalComponent, {
            panelClass: ['slider', 'user-info'],
            disableClose: true,
            closeOnNavigation: false,
            data: {}
        });
    }
    openLoginAttempts() {
        this.closeProfileDropdown();
        this.dialog.open(LoginAttemptsModalComponent, {
            panelClass: ['slider', 'user-info'],
            disableClose: true,
            closeOnNavigation: false,
            data: {}
        });
    }
    openHelp() {
        this.closeProfileDropdown();
        if (this.helpLink) {
            window.open(this.helpLink, '_blank');
        } else {
            // Fallback to the support center link shown in the footer
            window.open('https://support.upgrade.chat', '_blank');
        }
    }

    openAccount() {
        this.closeProfileDropdown();
        // TODO: Implement account functionality
        abp.notify.info('Account clicked');
    }

    signOut() {
        this.closeProfileDropdown();
        this.authService.logout(true);
    }

    private loadTailwindCSS(): void {
        // Check if Tailwind is already loaded
        if (this.document.querySelector('script[src*="tailwindcss"]')) {
            return;
        }

        // Create and load Tailwind CSS script
        this.tailwindScript = this.document.createElement('script');
        this.tailwindScript.src = 'https://cdn.tailwindcss.com';
        this.tailwindScript.async = true;
        this.document.head.appendChild(this.tailwindScript);
    }

    private removeTailwindCSS(): void {
        // Remove Tailwind CSS script when component is destroyed
        if (this.tailwindScript && this.tailwindScript.parentNode) {
            this.tailwindScript.parentNode.removeChild(this.tailwindScript);
        }
    }
    ngOnDestroy() {
        // Clean up event listeners when component is destroyed
        document.removeEventListener('click', this.documentClickHandler);
        this.removeTailwindCSS();
        document.removeEventListener('click', this.profileDocumentClickHandler);
    }
}
