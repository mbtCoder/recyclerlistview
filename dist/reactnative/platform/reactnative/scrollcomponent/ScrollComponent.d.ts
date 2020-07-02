/// <reference types="react" />
import { NativeScrollEvent, NativeSyntheticEvent } from "react-native";
import BaseScrollComponent, { ScrollComponentProps } from "../../../core/scrollcomponent/BaseScrollComponent";
/***
 * The responsibility of a scroll component is to report its size, scroll events and provide a way to scroll to a given offset.
 * RecyclerListView works on top of this interface and doesn't care about the implementation. To support web we only had to provide
 * another component written on top of web elements
 */
export default class ScrollComponent extends BaseScrollComponent {
    static defaultProps: {
        contentHeight: number;
        contentWidth: number;
        externalScrollView: unknown;
        isHorizontal: boolean;
        scrollThrottle: number;
    };
    private _height;
    private _width;
    private _offset;
    private _isSizeChangedCalledOnce;
    private _scrollViewRef;
    /**
     * @todo: 下拉刷新&上拉加载
     */
    private arrowTransform;
    private readonly defaultArrowIcon;
    private dragState;
    private readonly prStorageKey;
    private flag;
    constructor(args: ScrollComponentProps);
    scrollTo(x: number, y: number, isAnimated: boolean): void;
    render(): JSX.Element;
    /**
     * @todo: 下拉刷新&上拉加载
     * @function: 滚动动画结束回调
     */
    onMomentumScrollEnd(e: NativeSyntheticEvent<NativeScrollEvent>): void;
    /**
     * @todo: 下拉刷新&上拉加载
     * @function: 用户开始拖拽
     */
    onScrollBeginDrag(e: NativeSyntheticEvent<NativeScrollEvent>): void;
    /**
     * @todo: 下拉刷新&上拉加载
     * @function: 用户停止拖拽
     */
    onScrollEndDrag(e: NativeSyntheticEvent<NativeScrollEvent>): void;
    /**
     * @todo: 下拉刷新&上拉加载
     * @function: 下拉刷新指示器模块
     */
    renderIndicatorModule(): JSX.Element;
    /**
     * @todo: 下拉刷新&上拉加载
     * @function: 下拉刷新模块
     */
    renderNormalContent(): JSX.Element;
    /**
     * @todo: 下拉刷新&上拉加载
     * @function: 上拉加载指示器模块
     */
    renderIndicatorContentBottom(): JSX.Element;
    /**
     * @todo: 下拉刷新&上拉加载
     * @function: 上拉加载模块
     */
    renderBottomContent(): JSX.Element[];
    /**
     * @todo: 下拉刷新&上拉加载
     * @function: 上拉加载Normal状态
     */
    onLoadNormal(): void;
    /**
     * @todo: 下拉刷新&上拉加载
     * @function: 正在加载更多
     */
    onLoadingMore(): void;
    /**
     * @todo: 下拉刷新&上拉加载
     * @function: 无数据状态
     */
    onNoDataToLoad(): void;
    /**
     * @todo: 下拉刷新&上拉加载
     * @function: 结束刷新
     */
    onRefreshEnd(): void;
    /**
     * @todo: 下拉刷新&上拉加载
     * @function: 开始刷新
     */
    onRefreshing(): void;
    /**
     * @todo: 下拉刷新&上拉加载
     * @function: 高于临界值状态
     */
    upState(): void;
    /**
     * @todo: 下拉刷新&上拉加载
     * @function: 低于临界值状态
     */
    downState(): void;
    private _getContentHeight;
    private _defaultContainer;
    private _getScrollViewRef;
    private readonly _onScroll;
    private readonly _onLayout;
}
/**
 * @todo: 下拉刷新&上拉加载
 * @description: 常量定义
 */
export declare const PULL_REFRESH_HEIGHT = 60;
export declare const ANDROID_REFRESHING_HEIGHT = 0.5;
export declare const ANDROID: boolean;
export declare const IOS: boolean;
