/** Core imports */
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

/** Third party imports */
import { takeUntil } from 'rxjs/operators';

/** Application imports */
import { LifecycleSubjectsService } from '@shared/common/lifecycle-subjects/lifecycle-subjects.service';
import { AppLocalizationService } from '@app/shared/common/localization/app-localization.service';
import { AccountSelectorService } from '@app/shared/layout/account-selector/account-selector.service';

@Component({
    selector: 'referral-layout-base',
    templateUrl: 'referral-layout-base.component.html',
    styleUrls: [
        '../../../shared/common/dx-data-grid/dx-data-grid.directive.less',
        'referral-layout-base.component.less'
    ],
    providers: [LifecycleSubjectsService],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReferralLayoutBaseComponent implements OnDestroy {
    readonly DASHBOARD_TAB_INDEX    = 0;
    readonly LINKS_TAB_INDEX        = 1;
    readonly COMMISSIONS_TAB_INDEX  = 2;
    readonly LEDGER_TAB_INDEX       = 3;

    selectedTabIndex: number = this.DASHBOARD_TAB_INDEX;
    showReferralInfo = true;
    constructor(
        private changeDetectorRef: ChangeDetectorRef,
        private lifeCycleSubject: LifecycleSubjectsService,
        public accountSelectorService: AccountSelectorService,
        public activatedRoute: ActivatedRoute,
        public ls: AppLocalizationService,
        public router: Router
    ) {
        activatedRoute.queryParams.pipe(
            takeUntil(this.lifeCycleSubject.deactivate$),
        ).subscribe(params => {
            let tab = params['tab'];
            if (tab && !isNaN(tab)) {
                this.selectedTabIndex = parseInt(tab);
                this.changeDetectorRef.markForCheck();
                this.router.navigate([], {
                    queryParams: {
                        'tab': null
                    }
                });
            }
        });
    }

    ngOnDestroy() {
        this.lifeCycleSubject.deactivate.next();
    }
}