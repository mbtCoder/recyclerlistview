import * as React from "react";
import {Dimension} from "../dependencies/LayoutProvider";
import BaseScrollView, {ScrollEvent, ScrollViewDefaultProps} from "./BaseScrollView";
import {NativeScrollEvent, NativeSyntheticEvent, ScrollViewProps, StyleProp, ViewStyle} from "react-native";

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
    scrollViewProps: ScrollViewProps; // 库源类型补充
    onEndReached?: ((info: { distanceFromEnd: number }) => void) | null; // 库源类型补充
    refreshText?: string;
    refreshingText?: string;
    endingText?: string;
    endText?: string;
    noDataText?: string;
    refreshedText?: string;
    refreshType?: string;
    onRefresh?: () => void;
    flag?: string;
    onScrollBeginDrag?: (event?: NativeSyntheticEvent<NativeScrollEvent>) => void;
    indicatorArrowImg?: {
        style: StyleProp<ViewStyle>
        url: string;
    };
    arrowStyle?: StyleProp<ViewStyle>;
    indicatorImg?: {
        style: StyleProp<ViewStyle>;
        url: string;
    };
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
    public abstract scrollTo(x: number, y: number, animate: boolean): void;
}
