/// <reference types="react" />
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
     * 上拉加载&下拉刷新
     */
    private _dummyOnLayout;
    private transform;
    private readonly base64Icon;
    private readonly loadMoreHeight;
    private dragFlag;
    private readonly prStoryKey;
    private flag;
    private timer;
    constructor(args: ScrollComponentProps);
    scrollTo(x: number, y: number, isAnimated: boolean): void;
    componentDidMount(): void;
    render(): JSX.Element;
    onScrollBeginDrag(): void;
    onScrollEndDrag(e: any): void;
    renderIndicatorContent(): JSX.Element;
    renderNormalContent(): any;
    renderIndicatorContentBottom(): JSX.Element;
    renderBottomContent(): JSX.Element[];
    /**
     * 数据加载完成
     */
    onLoadFinish(): void;
    /**
     * 没有数据可加载
     */
    onNoDataToLoad(): void;
    /**
     * @function: 刷新结束
     */
    onRefreshEnd(): void;
    upState(): void;
    downState(): void;
    private _defaultContainer;
    private _getScrollViewRef;
    private _onScroll;
    private _onLayout;
}
