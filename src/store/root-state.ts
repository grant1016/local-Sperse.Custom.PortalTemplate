import { CurrenciesStoreState } from './currencies-store';
import { StatesStoreState } from './states-store';
import { CountriesStoreState } from './countries-store';

export interface State {
    currencies: CurrenciesStoreState.State;
    states: StatesStoreState.State;
    countries: CountriesStoreState.State;
}
