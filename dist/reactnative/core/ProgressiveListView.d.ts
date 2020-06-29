import RecyclerListView, { RecyclerListViewProps, RecyclerListViewState } from "./RecyclerListView";
export interface ProgressiveListViewProps extends RecyclerListViewProps {
    maxRenderAhead?: number;
    renderAheadStep?: number;
}
/**
 * This will incremently update renderAhread distance and render the page progressively.
 */
export default class ProgressiveListView extends RecyclerListView<ProgressiveListViewProps, RecyclerListViewState> {
    static defaultProps: {
        maxRenderAhead: number;
        renderAheadStep: number;
        renderAheadOffset: number;
        canChangeSize: boolean;
        disableRecycling: boolean;
        initialOffset: number;
        initialRenderIndex: number;
        isHorizontal: boolean;
        onEndReachedThreshold: number;
        refreshReleaseText: string;
        refreshLoadingText: string;
        refreshNormalText: string;
        loadMoreNormalText: string;
        loadMoreNoDataText: string;
        loadMoreLoadingText: string;
        indicatorArrowImg: {
            style: {};
            url: string;
        };
        indicatorImg: {
            style: {};
            url: string;
        };
        refreshType: string;
        useLoadMore: boolean;
    };
    private renderAheadUdpateCallbackId?;
    componentDidMount(): void;
    private updateRenderAheadProgessively;
    private incrementRenderAhead;
    private cancelRenderAheadUpdate;
}
