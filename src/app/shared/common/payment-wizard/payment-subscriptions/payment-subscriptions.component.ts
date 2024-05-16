/** Core imports */
import {
    Component,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    EventEmitter,
    Injector,
    Output,
    ViewChild,
    OnInit
} from '@angular/core';

/** Third party imports */
import { MatDialog } from '@angular/material/dialog';
import { finalize } from 'rxjs/operators';
import { forkJoin } from 'rxjs';
import { CreditCard } from 'angular-cc-library';

/** Application imports */
import * as moment from 'moment-timezone';
import {
    PaymentPeriodType,
    RecurringPaymentFrequency,
    CancelOrderSubscriptionInput,
    UserSubscriptionServiceProxy,
    OrderSubscriptionDto,
    PaymentMethodInfo,
    PaymentInfoType,
    BankCardShortInfo
} from '@shared/service-proxies/service-proxies';
import { PaymentService } from '@app/shared/common/payment-wizard/payment.service';
import { CancelSubscriptionDialogComponent } from '@app/crm/contacts/subscriptions/cancel-subscription-dialog/cancel-subscription-dialog.component';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AppService } from '@app/app.service';
import { AppConsts } from '@shared/AppConsts';
import { ActionMenuItem } from '@app/shared/common/action-menu/action-menu-item.interface';
import { ActionMenuService } from '@app/shared/common/action-menu/action-menu.service';
import { ActionMenuComponent } from '@app/shared/common/action-menu/action-menu.component';
import { AppPermissions } from '@root/shared/AppPermissions';
import { PaymentsInfoService } from '../../payments-info/payments-info.service';
import { DxDataGridComponent } from 'devextreme-angular/ui/data-grid';

@Component({
    selector: 'payment-subscriptions',
    templateUrl: './payment-subscriptions.component.html',
    styleUrls: ['./payment-subscriptions.component.less'],
    providers: [UserSubscriptionServiceProxy],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PaymentSubscriptionsComponent extends AppComponentBase implements OnInit {
    @ViewChild(DxDataGridComponent) dataGrid: DxDataGridComponent;
    @ViewChild(ActionMenuComponent) actionMenu: ActionMenuComponent;
    @Output() onShowProducts: EventEmitter<any> = new EventEmitter<any>();
    
    formatting = AppConsts.formatting;
    paymentMethodsTypes = PaymentInfoType;
    orderSubscriptions: OrderSubscriptionDto[];
    subscriptionLastPaymentInfos: {[id: number]: PaymentMethodInfo} = {};

    actionMenuItems: ActionMenuItem[] = [
        {
            text: this.l('Upgrade'),
            class: 'notes',
            checkVisible: (record: OrderSubscriptionDto) => this.showUpgradeButton(record),
            action: this.upgradeSubscription.bind(this)
        },
        {
            text: this.l('Cancel'),
            class: 'delete',
            action: this.cancelSubscription.bind(this)
        }
    ];
    actionRecordData: OrderSubscriptionDto;

    constructor(
        injector: Injector,
        public appService: AppService,
        public paymentService: PaymentService,
        private dialog: MatDialog,
        private subscriptionProxy: UserSubscriptionServiceProxy,
        private paymentInfoService: PaymentsInfoService,
        private changeDetectionRef: ChangeDetectorRef
    ) {
        super(injector);
    }

    ngOnInit() {
        this.startLoading();
        forkJoin([
            this.paymentInfoService.getPaymentMethodsObserverable(),
            this.subscriptionProxy.getSubscriptionHistory()
            //this.subscriptionProxy.getSubscriptionsLastPaymentInfo(subscriptionIds)
        ]).subscribe(([allPaymentMethods, subscriptions/*, lastPayments */]) => {
/*
            subscriptionIds.forEach(v => {
                let paymentInfo = lastPayments.subscriptionsLastPayment[v];
                if (paymentInfo){
                    let paymentMethod = allPaymentMethods.find(v => v.id == paymentInfo.paymentInfoId);
                    if (paymentMethod) {
                        paymentMethod['gateway'] = paymentInfo.gateway;
                        this.subscriptionLastPaymentInfos[v] = paymentMethod;
                    }
                }
            });
*/
            this.orderSubscriptions = subscriptions;
            this.finishLoading();
            this.changeDetectionRef.detectChanges();
            this.repaintGrid();
        });
    }

    repaintGrid() {
        setTimeout(() => this.dataGrid.instance.repaint(), 100);
    }

    getDistinctList(list): OrderSubscriptionDto[] {
        if (list) {
            let flags = [], output = [];
            for (let i = 0; i < list.length; i++)
                if (!flags[list[i].id]) {
                    flags[list[i].id] = true;
                    output.push(list[i]);
                }
            return output;
        } else
            return [];
    }

    isExpired(cell) {
        return (cell.data.paymentPeriodType != RecurringPaymentFrequency.LifeTime || cell.data.isTrial == 'true') &&
            cell.data.endDate && moment(cell.data.endDate).diff(moment(), 'minutes') <= 0;
    }

    toggleActionsMenu(event, data) {
        this.actionRecordData = data;
        ActionMenuService.prepareActionMenuItems(this.actionMenuItems, this.actionRecordData);
        this.actionMenu.toggle(event.target);
    }

    onMenuItemClick(event) {
        event.itemData.action.call(this);
        this.actionRecordData = null;
        this.actionMenu.hide();
    }

    showUpgradeButton(data: OrderSubscriptionDto) {
        return data.statusCode == 'A' && data.isUpgradable;
    }

    showPaymentMethodMenuOption(actionRecordData: OrderSubscriptionDto): boolean {
        let showPaymentMethod = 
            [RecurringPaymentFrequency.OneTime, RecurringPaymentFrequency.LifeTime].indexOf(actionRecordData.paymentPeriodType) < 0 &&
            this.subscriptionLastPaymentInfos[actionRecordData.id] && this.subscriptionLastPaymentInfos[actionRecordData.id]['gateway'];

        return !!showPaymentMethod;
    }

    upgradeSubscription() {
        this.onShowProducts.emit({ upgrade: true, productId: this.actionRecordData.productId });
    }

    cancelSubscription() {
        let capturedData = this.actionRecordData;
        this.dialog.open(CancelSubscriptionDialogComponent, {
            width: '400px',
            data: {
                title: this.l('CancelBillingConfirm')
            }
        }).afterClosed().subscribe(result => {
            if (result) {
                this.startLoading();
                this.subscriptionProxy
                    .cancel(new CancelOrderSubscriptionInput({
                        subscriptionId: capturedData.id,
                        cancelationReason: result.cancellationReason
                    })).pipe(finalize(() => this.finishLoading())).subscribe(() => {
                        capturedData.statusCode = 'C';
                        abp.notify.success(this.l('Cancelled'));
                        this.changeDetectionRef.detectChanges();
                        setTimeout(() => location.reload(), 1000);
                    });
            }
        });
    }

    showAddOnProducts() {
        this.onShowProducts.emit({ productsGroupName: AppConsts.PRODUCT_GROUP_ADD_ON });
    }

    getCardType(cardInfo: BankCardShortInfo): string {
        if (cardInfo.network)
            return cardInfo.network;

        let numberInfo = CreditCard.cardFromNumber(cardInfo.cardNumber);
        return numberInfo && numberInfo.type || 'credit-card';
    }
}