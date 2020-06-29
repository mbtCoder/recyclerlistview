import * as React from "react";
import { Dimension } from "../dependencies/LayoutProvider";
import BaseScrollView, { ScrollEvent, ScrollViewDefaultProps } from "./BaseScrollView";
import { NativeScrollEvent, NativeSyntheticEvent, ScrollViewProps, StyleProp, ViewStyle } from "react-native";
import { BaseDataProvider } from "../dependencies/DataProvider";

export interface ScrollComponentProps extends CustomRefreshProps {
    onSizeChanged: (dimensions: Dimension) => void;
    onScroll: (offsetX: number, offsetY: number, rawEvent: ScrollEvent) => void;
    contentHeight: number;
    contentWidth: number;
    canChangeSize?: boolean;
    externalScrollView?: { new(props: ScrollViewDefaultProps): BaseScrollView };
    isHorizontal?: boolean;
    renderFooter?: () => JSX.Element | JSX.Element[] | null;
    scrollThrottle?: number;
    useWindowScroll?: boolean;
    onLayout?: any;
    renderContentContainer?: (props?: object, children?: React.ReactNode) => React.ReactNode | null;
    renderAheadOffset: number;
}

/**
 *  下拉刷新&上拉加载 类型补充
 */
interface CustomRefreshProps {
    scrollViewProps?: ScrollViewProps; // 库源类型补充
    onEndReached?: () => void; // 库源类型补充 源库实际调用就是无参函数
    refreshNormalText?: string;
    refreshLoadingText?: string;
    refreshReleaseText?: string;
    loadMoreNormalText?: string;
    loadMoreLoadingText?: string;
    loadMoreNoDataText?: string;
    refreshType?: string;
    onRefresh?: () => void;
    useLoadMore?: boolean;
    flag?: string;
    onScrollBeginDrag?: (event?: NativeSyntheticEvent<NativeScrollEvent>) => void;
    onScrollEndDrag?: (event?: NativeSyntheticEvent<NativeScrollEvent>) => void;
    onMomentumScrollEnd?: (event?: NativeSyntheticEvent<NativeScrollEvent>) => void;
    indicatorArrowImg?: {
        style: ViewStyle
        url: string;
    };
    arrowStyle?: StyleProp<ViewStyle>;
    indicatorImg?: {
        style: ViewStyle;
        url: string;
    };
    dataProvider: BaseDataProvider;
}

/**
 *  下拉刷新&上拉加载 类型补充
 */
interface ScrollComponentState {
    loadTitle: string;
    prTitle: string;
    prLoading: boolean;
    prArrowDeg: any;
    prTimeDisplay: string;
    prState: number;
}

export default abstract class BaseScrollComponent extends React.Component<ScrollComponentProps, ScrollComponentState> {
    /**
     *  下拉刷新&上拉加载
     */
    public abstract onLoadingMore(): void;

    public abstract onRefreshing(): void;

    public abstract onRefreshEnd(): void;

    public abstract onLoadNormal(): void;

    public abstract onNoDataToLoad(): void;

    public abstract scrollTo(x: number, y: number, animate: boolean): void;
}
