import {
    SettingScopes
} from '@shared/service-proxies/service-proxies';
import { AppPermissions } from '@shared/AppPermissions';

export class AppTimezoneScope {
    static Application: number = SettingScopes.Application;
    static Tenant: number = SettingScopes.Tenant;
    static User: number = SettingScopes.User;
}

export class AppEditionExpireAction {
    static DeactiveTenant = 'DeactiveTenant';
    static AssignToAnotherEdition = 'AssignToAnotherEdition';
}

export class LinkType {
    static Facebook = 'F';
    static GooglePlus = 'G';
    static LinkedIn = 'L';
    static Pinterest = 'P';
    static Twitter = 'T';
    static Website = 'J';
    static Alexa = 'A';
    static BBB = 'B';
    static Crunchbase = 'C';
    static Domain = 'D';
    static Yelp = 'E';
    static Instagram = 'I';
    static Nav = 'N';
    static OpenCorporates = 'O';
    static Trustpilot = 'R';
    static GlassDoor = 'S';
    static Followers = 'W';
    static Youtube = 'Y';
    static RSS = 'Z';
}

export class LinkUsageType {
    static Home = 'H';
    static Mobile = 'M';
    static Work = 'W';
}

export class AddressUsageType {
    static Shipping = 'S';
}

export class ContactTypes {
    static Personal = 'personal';
    static Business = 'business';
}

export class ContactStatus {
    static Prospective = 'P';
    static Active = 'A';
    static Inactive = 'I';
}

export class ContactGroup {
    static Client = 'C';
    static Partner = 'P';
    static Employee = 'U';
    static Investor = 'I';
    static Vendor = 'V';
}

export class ContactGroupPermission {
    static Client = AppPermissions.CRMCustomers;
    static Partner = AppPermissions.CRMPartners;
    static Employee = AppPermissions.CRMEmployees;
    static Investor = AppPermissions.CRMInvestors;
    static Vendor = AppPermissions.CRMVendors;
}

export class PersonOrgRelationType {
    static Owner = 'O';
    static CoOwner = 'C';
    static Shareholder = 'S';
    static Employee = 'E';
}

export class ODataSearchStrategy {
    static Contains = 'contains';
    static StartsWith = 'startswith';
    static Equals = 'equals';
}

export enum ImportStatus {
    Cancelled = 'A',
    Completed = 'C',
    InProgress = 'I',
    New = 'N',
    Failed = 'F'
}

export enum AccountConnectors {
    Plaid = 'Plaid',
    QuickBook = 'QuickBook',
    XeroOAuth2 = 'XeroOAuth2'
}

export enum SyncTypeIds {
    Plaid = 'P',
    QuickBook = 'B',
    XeroOAuth2 = 'O'
}

export enum ConditionsType {
    Terms = 'Terms',
    Policies = 'Policies'
}

export enum ActionButtonType {
    Edit,
    Delete,
    Send,
    Cancel,
    MarkAsSent,
    MarkAsDraft
}

export enum NavigationState {
    Prev    = -1,
    Current = 0,
    Next    = 1
}
