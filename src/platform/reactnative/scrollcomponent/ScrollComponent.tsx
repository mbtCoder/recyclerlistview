import * as React from "react";
import {
    Animated, Dimensions, StyleSheet, Text,
    LayoutChangeEvent,
    NativeScrollEvent,
    NativeSyntheticEvent, Platform,
    ScrollView,
    View, Easing, StyleProp, ViewStyle, ImageBackground, ActivityIndicator, TransformsStyle,
} from "react-native";
import BaseScrollComponent, { ScrollComponentProps } from "../../../core/scrollcomponent/BaseScrollComponent";
import TSCast from "../../../utils/TSCast";
import AsyncStorage from "@react-native-community/async-storage";
import { BaseItemAnimator } from "../../../core/ItemAnimator";

/***
 * The responsibility of a scroll component is to report its size, scroll events and provide a way to scroll to a given offset.
 * RecyclerListView works on top of this interface and doesn't care about the implementation. To support web we only had to provide
 * another component written on top of web elements
 */

export default class ScrollComponent extends BaseScrollComponent {
    public static defaultProps = {
        contentHeight: 0,
        contentWidth: 0,
        externalScrollView: TSCast.cast(ScrollView), //TSI
        isHorizontal: false,
        scrollThrottle: 16,
    };

    private _height: number;
    private _width: number;
    private _offset: number;
    private _isSizeChangedCalledOnce: boolean;
    private _scrollViewRef: ScrollView | null = null;

    /**
     * 上拉加载&下拉刷新
     */
    private arrowTransform: TransformsStyle;
    private readonly defaultArrowIcon: string; // 默认下拉刷新箭头图标
    private dragState: boolean; // 用户是否拖动列表
    private readonly prStorageKey: string; // 下拉刷新持久化记录key
    private flag: any; // 预留接口 新旧值不同重新执行刷新
    // @ts-ignore
    private timer: NodeJS.Timeout;
    private _endDragPoint: number; // 用户停止拖动点
    private _beginDragPoint: number; // 用户开始拖动点

    constructor(args: ScrollComponentProps) {
        super(args);
        this._height = 0;
        this._width = 0;
        this._offset = 0;
        this._isSizeChangedCalledOnce = false;

        /**
         * 下拉刷新&上拉加载
         */
        this.state = {
            prTitle: args.refreshNormalText!,
            loadTitle: args.loadMoreNormalText!,
            prLoading: false,
            prArrowDeg: new Animated.Value(0),
            prTimeDisplay: "暂无更新",
            prState: 0,
        };
        this.flag = args.flag;
        this.prStorageKey = "prTimeKey";
        this.arrowTransform = {
            transform: [{
                rotate: "",
            }],
        };
        this.dragState = false;
        this._endDragPoint = 0;
        this._beginDragPoint = 0;
        // tslint:disable-next-line:max-line-length
        this.defaultArrowIcon = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAABQBAMAAAD8TNiNAAAAJ1BMVEUAAACqqqplZWVnZ2doaGhqampoaGhpaWlnZ2dmZmZlZWVmZmZnZ2duD78kAAAADHRSTlMAA6CYqZOlnI+Kg/B86E+1AAAAhklEQVQ4y+2LvQ3CQAxGLSHEBSg8AAX0jECTnhFosgcjZKr8StE3VHz5EkeRMkF0rzk/P58k9rgOW78j+TE99OoeKpEbCvcPVDJ0OvsJ9bQs6Jxs26h5HCrlr9w8vi8zHphfmI0fcvO/ZXJG8wDzcvDFO2Y/AJj9ADE7gXmlxFMIyVpJ7DECzC9J2EC2ECAAAAAASUVORK5CYII=";
        this._onScroll = this._onScroll.bind(this);
        this._onLayout = this._onLayout.bind(this);
    }

    public scrollTo(x: number, y: number, isAnimated: boolean): void {
        if (this._scrollViewRef) {
            this._scrollViewRef.scrollTo({ x, y, animated: isAnimated });
        }
    }

    // UNSAFE_componentWillReceiveProps(nextProps: Readonly<ScrollComponentProps>, nextContext: any) {
    // if (this.flag !== this.props.flag) {
    //     if (Platform.OS === 'android') {
    //         this.setState({
    //             prTitle: this.props.refreshLoadingText,
    //             prLoading: true,
    //             prArrowDeg: new Animated.Value(0),
    //
    //         });
    //         this.timer = setTimeout(() => {
    //             this._scrollViewRef &&
    //             this._scrollViewRef.scrollTo({x: 0, y: PULL_REFRESH_HEIGHT, animated: true});
    //             this.timer && clearTimeout(this.timer);
    //         }, 1000);
    //     }
    //     this.flag = this.props.flag;
    // }
    // }
    public render(): JSX.Element {
        const Scroller = TSCast.cast<ScrollView>(this.props.externalScrollView); //TSI
        const renderContentContainer = this.props.renderContentContainer ? this.props.renderContentContainer : this._defaultContainer;
        const contentContainerProps = {
            style: {
                height: this.props.contentHeight,
                width: this.props.contentWidth,
            },
            horizontal: this.props.isHorizontal,
            scrollOffset: this._offset,
            windowSize: (this.props.isHorizontal ? this._width : this._height) + this.props.renderAheadOffset,
        };
        //TODO:Talha
        // const {
        //     useWindowScroll,
        //     contentHeight,
        //     contentWidth,
        //     externalScrollView,
        //     canChangeSize,
        //     renderFooter,
        //     isHorizontal,
        //     scrollThrottle,
        //     ...props,
        // } = this.props;
        return (
            <Scroller ref={this._getScrollViewRef}
                      removeClippedSubviews={false}
                      scrollEventThrottle={this.props.scrollThrottle}
                      {...this.props}
                      horizontal={this.props.isHorizontal}
                      onScroll={this._onScroll}
                      onLayout={(!this._isSizeChangedCalledOnce || this.props.canChangeSize) ? this._onLayout : this.props.onLayout}
                      bounces={!!this.props.onRefresh}
                      onScrollEndDrag={(e: any) => this.onScrollEndDrag(e!)}
                      onScrollBeginDrag={(e: any) => this.onScrollBeginDrag(e)}
                      onMomentumScrollEnd={(e: any) => this.onMomentumScrollEnd(e)}>
                <View style={{ flexDirection: this.props.isHorizontal ? "row" : "column" }}>
                    {this.props.onRefresh ? this.renderIndicatorModule() : null}

                    <View style={{
                        // tslint:disable-next-line:max-line-length
                        height: Platform.OS === "ios" ? this.props.contentHeight : (SCREEN_HEIGHT - this.props.contentHeight < 0 ? this.props.contentHeight : this._height),
                        width: this.props.contentWidth,
                    }}>
                        {renderContentContainer(contentContainerProps, this.props.children)}
                    </View>

                    {this.props.renderFooter ? this.props.renderFooter() : null}

                    {this.props.useLoadMore && this.props.onEndReached ? this.renderIndicatorContentBottom() : null}
                </View>
            </Scroller>
        );
    }

    public onMomentumScrollEnd(e: NativeSyntheticEvent<NativeScrollEvent>): void {
        // 回调给父级
        if (this.props.onMomentumScrollEnd) {
            this.props.onMomentumScrollEnd(e);
        }
        if (Platform.OS === "android") {
            const target = e.nativeEvent;
            const y = target.contentOffset.y;

            // 用户惯性滚动完成时  恢复至默认高度
            if (y <= PULL_REFRESH_HEIGHT && this._beginDragPoint > PULL_REFRESH_HEIGHT && this._endDragPoint > PULL_REFRESH_HEIGHT && this._scrollViewRef) {
                this._scrollViewRef.scrollTo({ x: 0, y: PULL_REFRESH_HEIGHT, animated: true });
            }
        }
    }

    // 手指未离开
    public onScrollBeginDrag(e: NativeSyntheticEvent<NativeScrollEvent>): void {
        // 回调给父级
        if (this.props.onScrollBeginDrag) {
            this.props.onScrollBeginDrag(e);
        }
        const target = e.nativeEvent;
        const y = target.contentOffset.y;

        this._beginDragPoint = y;
        this.dragState = true;
    }

    // 手指离开
    public onScrollEndDrag(e: NativeSyntheticEvent<NativeScrollEvent>): void {
        // 回调给父级
        if (this.props.onScrollEndDrag) {
            this.props.onScrollEndDrag(e);
        }
        if (this._scrollViewRef && this.props.onRefresh) {
            const target = e.nativeEvent;
            const y = target.contentOffset.y;

            this._endDragPoint = y;
            this.dragState = false;

            if (y <= PULL_REFRESH_HEIGHT && y >= 10 && Platform.OS === "android") {
                this._scrollViewRef.scrollTo({ x: 0, y: PULL_REFRESH_HEIGHT, animated: true });
            }
            if (this.state.prState) {
                // ios固定到下拉刷新模块高度
                if (Platform.OS === "ios") {
                    this._scrollViewRef.scrollTo({ x: 0, y: ~PULL_REFRESH_HEIGHT, animated: true });
                }

                this.setState({
                    prTitle: this.props.refreshLoadingText!,
                    prLoading: true,
                    prArrowDeg: new Animated.Value(0),
                    prState: 0,
                });

                // 触发外部的下拉刷新
                this.props.onRefresh();
            }
        }
    }

    /**
     * 下拉刷新模块
     */
    public renderIndicatorModule(): JSX.Element {
        const type = this.props.refreshType;
        const jsx = [this.renderNormalContent()];

        return (
            <View style={Platform.OS === "ios" ? styles.pullRefresh : {
                width: SCREEN_WIDTH,
                height: PULL_REFRESH_HEIGHT,
                justifyContent: "center",
            }}>
                {jsx.map((item, index) => {
                    return <View key={index}>{item}</View>;
                })}
            </View>
        );
    }

    public renderNormalContent(): JSX.Element {
        this.arrowTransform = {
            transform: [{
                rotate: this.state.prArrowDeg.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["0deg", "-180deg"],
                }),
            }],
        };
        const jsxarr = [];
        let arrowStyle: ViewStyle = {
            position: "absolute",
            width: 14,
            height: 23,
            left: -50,
            top: -4,
            transform: this.arrowTransform.transform,
        };
        let indicatorStyle: StyleProp<ViewStyle> = {
            position: "absolute",
            left: -40,
            top: 2,
            width: 16,
            height: 16,
        };

        if (this.props.indicatorImg!.url) {
            if (Object.keys(this.props.indicatorImg!.style as object).length === 0) {
                indicatorStyle = this.props.indicatorImg!.style;
            }
            if (this.state.prLoading) {
                jsxarr.push(<ImageBackground style={indicatorStyle} source={{ uri: this.props.indicatorImg!.url }}/>);
            } else {
                jsxarr.push(null);
            }
        } else if (this.state.prLoading) {
            jsxarr.push(<ActivityIndicator style={indicatorStyle} animating color={"#488eff"}/>);
        } else {
            jsxarr.push(null);
        }

        if (this.props.indicatorArrowImg!.url) {
            // 如果传了箭头样式
            if (Object.keys(this.props.indicatorArrowImg!.style as object).length === 0) {
                arrowStyle = this.props.indicatorArrowImg!.style as ViewStyle;
            }
            arrowStyle.transform = this.arrowTransform.transform;
            if (!this.state.prLoading) {
                jsxarr.push(<Animated.Image style={arrowStyle} resizeMode={"contain"}
                                            source={{ uri: this.props.indicatorArrowImg!.url }}/>);
            } else {
                jsxarr.push(null);
            }
        } else if (!this.state.prLoading) {
            jsxarr.push(<Animated.Image style={arrowStyle} resizeMode={"contain"}
                                        source={{ uri: this.defaultArrowIcon }}/>);
        } else {
            jsxarr.push(null);
        }
        jsxarr.push(<Text style={styles.prState}>{this.state.prTitle}</Text>);

        return (
            <View style={{ alignItems: "center" }}>
                <View style={styles.indicatorContent}>

                    {jsxarr.map((item, index) => {
                        return <View key={index}>{item}</View>;
                    })}

                </View>
                <Text style={styles.prText}>上次更新：{this.state.prTimeDisplay}</Text>
            </View>
        );

    }

    public renderIndicatorContentBottom(): JSX.Element {
        const jsx = [this.renderBottomContent()];

        return (
            <View style={styles.loadMore}>

                {jsx.map((item, index) => {
                    return <View key={index}>{item}</View>;
                })}
            </View>
        );
    }

    public renderBottomContent(): JSX.Element[] {
        const jsx = [];
        const indicatorStyle: ViewStyle = {
            position: "absolute",
            left: -50,
            top: -1,
            width: 16,
            height: 16,
        };

        if (this.state.loadTitle === this.props.loadMoreLoadingText) {
            jsx.push(<ActivityIndicator key={"bottom_activityIndicator"} style={indicatorStyle} animating
                                        color={"#488eff"}/>);
        }

        jsx.push(<Text key={2} style={{ color: "#979aa0" }}>{this.state.loadTitle}</Text>);

        return jsx;
    }

    /**
     *  上拉加载正常状态
     */
    public onLoadNormal(): void {
        this.setState({ loadTitle: this.props.loadMoreNormalText! });
    }

    /**
     * 上拉加载更多
     */
    public onLoadingMore(): void {
        this.setState({ loadTitle: this.props.loadMoreLoadingText! });
    }

    /**
     * 没有数据可加载
     */
    public onNoDataToLoad(): void {
        this.setState({ loadTitle: this.props.loadMoreNoDataText! });
    }

    /**
     * @function: 刷新结束
     */
    public onRefreshEnd(): void {
        const now = new Date().getTime();
        this.setState({
            prTitle: this.props.refreshNormalText!,
            prLoading: false,
            prTimeDisplay: dateFormat(now, "yyyy-MM-dd hh:mm"),
        });

        // 存一下刷新时间
        AsyncStorage.setItem(this.prStorageKey, now.toString());
        if (this._scrollViewRef) {
            if (Platform.OS === "ios") {
                this._scrollViewRef.scrollTo({ x: 0, y: 0, animated: true });
            } else if (Platform.OS === "android") {
                this._scrollViewRef.scrollTo({ x: 0, y: PULL_REFRESH_HEIGHT, animated: true });
            }
        }
    }

    /**
     * @function: 刷新开始
     */
    public onRefreshing(): void {
        if (this.props.onRefresh && this._scrollViewRef) {
            this.setState({
                prTitle: this.props.refreshLoadingText!,
                prLoading: true,
                prArrowDeg: new Animated.Value(0),
            });

            if (Platform.OS === "ios") {
                console.log("RCL IOS 开始变成刷新状态");
                this._scrollViewRef.scrollTo({ x: 0, y: ~PULL_REFRESH_HEIGHT, animated: true });
            } else {
                this._scrollViewRef.scrollTo({ x: 0, y: 0.5, animated: true });
            }

            this.props.onRefresh();
        }
    }

    // 高于临界值状态
    public upState(): void {
        this.setState({
            prTitle: this.props.refreshReleaseText!,
            prState: 1,
        });

        Animated.timing(this.state.prArrowDeg, {
            useNativeDriver: BaseItemAnimator.USE_NATIVE_DRIVER,
            toValue: 1,
            duration: 100,
            easing: Easing.inOut(Easing.quad),
        }).start();
    }

    // 低于临界值状态
    public downState(): void {
        this.setState({
            prTitle: this.props.refreshNormalText!,
            prState: 0,
        });
        Animated.timing(this.state.prArrowDeg, {
            useNativeDriver: BaseItemAnimator.USE_NATIVE_DRIVER,
            toValue: 0,
            duration: 100,
            easing: Easing.inOut(Easing.quad),
        }).start();
    }

    private _defaultContainer(props: object, children: React.ReactNode): React.ReactNode | null {
        return (
            <View {...props}>
                {children}
            </View>
        );
    }

    private _getScrollViewRef = (scrollView: any) => {
        this._scrollViewRef = scrollView as (ScrollView | null);
    };

    private readonly _onScroll = (event?: NativeSyntheticEvent<NativeScrollEvent>): void => {
        if (event) {
            const contentOffset = event.nativeEvent.contentOffset;
            this._offset = this.props.isHorizontal ? contentOffset.x : contentOffset.y;
            this.props.onScroll(contentOffset.x, contentOffset.y, event);
        }

        // 开启下拉刷新时执行
        if (this.props.onRefresh) {
            // @ts-ignore
            const target = event.nativeEvent;
            const y = target.contentOffset.y;

            if (this.dragState) {
                if (Platform.OS === "ios") {
                    if (y <= ~PULL_REFRESH_HEIGHT) {
                        this.upState();

                    } else {
                        this.downState();
                    }
                } else if (Platform.OS === "android") {
                    if (y <= 10) {
                        this.upState();

                    } else {
                        this.downState();
                    }
                }
            } else {
                // 用户快速滑动放手后 导致弹簧到顶部触发
                if (y === 0 && Platform.OS === "android") {
                    this.setState({
                        prTitle: this.props.refreshLoadingText!,
                        prLoading: true,
                        prArrowDeg: new Animated.Value(0),
                    });
                    this.onRefreshEnd();
                }
            }
        }
    };

    private readonly _onLayout = (event: LayoutChangeEvent): void => {
        if (this._height !== event.nativeEvent.layout.height || this._width !== event.nativeEvent.layout.width) {
            this._height = event.nativeEvent.layout.height;
            this._width = event.nativeEvent.layout.width;
            if (this.props.onSizeChanged) {
                this._isSizeChangedCalledOnce = true;
                this.props.onSizeChanged(event.nativeEvent.layout);
            }
        }
        if (this.props.onLayout) {
            this.props.onLayout(event);
        }
    };
}

export const PULL_REFRESH_HEIGHT = 60;
const SCREEN_WIDTH = Dimensions.get("window").width;
const SCREEN_HEIGHT = Dimensions.get("window").height;
const dateFormat = (dateTime: number, fmt: string) => {
    const date = new Date(dateTime);

    let tmp = fmt || "yyyy-MM-dd";
    const o = {
        "M+": date.getMonth() + 1, //月份
        "d+": date.getDate(), //日
        "h+": date.getHours(), //小时
        "m+": date.getMinutes(), //分
        "s+": date.getSeconds(), //秒
        "q+": Math.floor((date.getMonth() + 3) / 3), //季度
        "S": date.getMilliseconds(), //毫秒
    };

    if (/(y+)/.test(tmp)) {
        tmp = tmp.replace(RegExp.$1, (String(date.getFullYear())).substr(4 - RegExp.$1.length));
    }
    for (const k in o) {
        if (new RegExp("(" + k + ")").test(tmp)) {
            // @ts-ignore
            tmp = tmp.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (("00" + o[k]).substr((String(o[k])).length)));
        }
    }
    return tmp;
};

const styles = StyleSheet.create({
    pullRefresh: {
        position: "absolute",
        top: ~PULL_REFRESH_HEIGHT,
        left: 0,
        backfaceVisibility: "hidden",
        right: 0,
        height: PULL_REFRESH_HEIGHT,
        alignItems: "center",
        justifyContent: "center",
    },
    loadMore: {
        height: 35,
        marginBottom: 10,
        alignItems: "center",
        justifyContent: "center",
    },
    text: {
        height: 70,
        backgroundColor: "#fafafa",
        color: "#979aa0",
    },
    prText: {
        marginBottom: 4,
        color: "#979aa0",
        fontSize: 12,
    },

    prState: {
        marginBottom: 4,
        fontSize: 12,
        color: "#979aa0",
    },
    lmState: {
        fontSize: 12,
    },
    indicatorContent: {
        flexDirection: "row",
        marginBottom: 5,
    },
});
