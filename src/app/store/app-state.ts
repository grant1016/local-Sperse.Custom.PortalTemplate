import { 
    PipelinesStoreState,
    ListsStoreState,
    RatingsStoreState,
    StarsStoreState,
    TagsStoreState
} from '@app/store/index';

export interface State {
    pipelines: PipelinesStoreState.State;
    lists: ListsStoreState.State;
    ratings: RatingsStoreState.State;
    stars: StarsStoreState.State;
    tags: TagsStoreState.State;
}
