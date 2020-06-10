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
    externalScrollView?: {
        new (props: ScrollViewDefaultProps): BaseScrollView;
    };
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
    scrollViewProps?: ScrollViewProps;
    onEndReached?: () => void;
    refreshNormalText?: string;
    refreshLoadingText?: string;
    refreshReleaseText?: string;
    loadMoreNormalText?: string;
    loadMoreLoadingText?: string;
    loadMoreNoDataText?: string;
    refreshType?: string;
    onRefresh?: () => void;
    useMountRefresh?: boolean;
    useLoadMore?: boolean;
    flag?: string;
    onScrollBeginDrag?: (event?: NativeSyntheticEvent<NativeScrollEvent>) => void;
    indicatorArrowImg?: {
        style: ViewStyle;
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
    beginScroll: boolean;
    prState: number;
}
export default abstract class BaseScrollComponent extends React.Component<ScrollComponentProps, ScrollComponentState> {
    /**
     *  下拉刷新&上拉加载
     */
    abstract onLoadingMore(): void;
    abstract onRefreshEnd(): void;
    abstract onLoadNormal(): void;
    abstract onNoDataToLoad(): void;
    abstract scrollTo(x: number, y: number, animate: boolean): void;
}
export {};
