import { 
    PipelinesStoreState,
    ListsStoreState,
    RatingsStoreState,
    StarsStoreState,
    StatusesStoreState,
    TagsStoreState
} from '@app/store/index';

export interface State {
    pipelines: PipelinesStoreState.State;
    lists: ListsStoreState.State;
    ratings: RatingsStoreState.State;
    stars: StarsStoreState.State;
    statuses: StatusesStoreState.State;
    tags: TagsStoreState.State;
}
