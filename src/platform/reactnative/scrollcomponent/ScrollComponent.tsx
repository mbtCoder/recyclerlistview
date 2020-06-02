import * as React from "react";
import {
    Animated, Dimensions, StyleSheet, AsyncStorage, Text,
    LayoutChangeEvent,
    NativeScrollEvent,
    NativeSyntheticEvent, Platform,
    ScrollView,
    View, Easing, StyleProp, ViewStyle, ImageBackground, ActivityIndicator,
} from "react-native";
import BaseScrollComponent, { ScrollComponentProps } from "../../../core/scrollcomponent/BaseScrollComponent";
import TSCast from "../../../utils/TSCast";

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
    private _dummyOnLayout: (event: LayoutChangeEvent) => void = TSCast.cast(null);
    private transform: any;
    private readonly base64Icon: any;
    private readonly loadMoreHeight: number;
    private dragFlag: boolean;
    private readonly prStoryKey: string;
    private flag: any;
    private timer: any;

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
            prTitle: args.refreshText!,
            loadTitle: args.endingText!,
            prLoading: false,
            prArrowDeg: new Animated.Value(0),
            prTimeDisplay: "暂无更新",
            beginScroll: null!,
            prState: 0,
        };
        this.flag = args.flag;
        this.prStoryKey = "prtimekey";
        this.loadMoreHeight = 60;
        this.dragFlag = false; //scrollview是否处于拖动状态的标志
        // tslint:disable-next-line:max-line-length
        this.base64Icon = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAABQBAMAAAD8TNiNAAAAJ1BMVEUAAACqqqplZWVnZ2doaGhqampoaGhpaWlnZ2dmZmZlZWVmZmZnZ2duD78kAAAADHRSTlMAA6CYqZOlnI+Kg/B86E+1AAAAhklEQVQ4y+2LvQ3CQAxGLSHEBSg8AAX0jECTnhFosgcjZKr8StE3VHz5EkeRMkF0rzk/P58k9rgOW78j+TE99OoeKpEbCvcPVDJ0OvsJ9bQs6Jxs26h5HCrlr9w8vi8zHphfmI0fcvO/ZXJG8wDzcvDFO2Y/AJj9ADE7gXmlxFMIyVpJ7DECzC9J2EC2ECAAAAAASUVORK5CYII=";
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
    //             prTitle: this.props.refreshingText,
    //             prLoading: true,
    //             prArrowDeg: new Animated.Value(0),
    //
    //         });
    //         this.timer = setTimeout(() => {
    //             this._scrollViewRef &&
    //             this._scrollViewRef.scrollTo({x: 0, y: this.loadMoreHeight, animated: true});
    //             this.timer && clearTimeout(this.timer);
    //         }, 1000);
    //     }
    //     this.flag = this.props.flag;
    // }
    // }

    // tslint:disable-next-line:typedef
    public componentDidMount() {
        if (Platform.OS === "android" &&
            this.props.onRefresh) {
            this.setState({
                prTitle: this.props.refreshingText!,
                prLoading: true,
                prArrowDeg: new Animated.Value(0),
            });
            this.timer = setTimeout(() => {
                if (this._scrollViewRef) {
                    this._scrollViewRef.scrollTo({ x: 0, y: this.loadMoreHeight, animated: true });
                }
                if (this.timer) {
                    clearTimeout(this.timer);
                }
            }, 1000);
        }
    }

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
                      onScrollEndDrag={(e) => this.onScrollEndDrag(e)}
                      onScrollBeginDrag={() => this.onScrollBeginDrag()}
                      onMomentumScrollEnd={(e: any) => {
                          if (Platform.OS === "android") {
                              const target = e.nativeEvent;
                              const y = target.contentOffset.y;

                              if (y <= this.loadMoreHeight) {
                                  this.setState({
                                      prTitle: this.props.refreshingText!,
                                      prLoading: true,
                                      prArrowDeg: new Animated.Value(0),
                                  });
                              }
                          }
                      }}>
                <View style={{ flexDirection: this.props.isHorizontal ? "row" : "column" }}>
                    {this.props.onRefresh ?
                        this.renderIndicatorContent() :
                        null}
                    <View style={{
                        // tslint:disable-next-line:max-line-length
                        height: Platform.OS === "ios" ? this.props.contentHeight : (Dimensions.get("window").height - this.props.contentHeight < 0 ? this.props.contentHeight : Dimensions.get("window").height),
                        width: this.props.contentWidth,
                    }}>

                        {renderContentContainer(contentContainerProps, this.props.children)}
                    </View>
                    {this.props.renderFooter ? this.props.renderFooter() : null}

                    {this.props.onEndReached ? this.renderIndicatorContentBottom() : null}
                </View>
            </Scroller>
        );
    }

    // 手指未离开
    public onScrollBeginDrag(): void {
        this.setState({
            beginScroll: true,
        });
        this.dragFlag = true;

        if (this.props.onScrollBeginDrag) {
            this.props.onScrollBeginDrag();
        }
    }

    // 手指离开
    public onScrollEndDrag(e: any): void {
        if (this._scrollViewRef) {
            const target = e.nativeEvent;
            const y = target.contentOffset.y;

            this.dragFlag = false;
            if (y <= this.loadMoreHeight && y >= 10 && Platform.OS === "android") {
                this._scrollViewRef.scrollTo({ x: 0, y: this.loadMoreHeight, animated: true });
            }
            if (this.state.prState) {

                // 回到待收起状态
                this._scrollViewRef.scrollTo({ x: 0, y: -70, animated: true });

                this.setState({
                    prTitle: this.props.refreshingText!,
                    prLoading: true,
                    prArrowDeg: new Animated.Value(0),
                    prState: 0,
                });

                // 触发外部的下拉刷新方法
                if (this.props.onRefresh) {
                    // @ts-ignore
                    this.props.onRefresh(this);
                }
            }
        }
    }

    public renderIndicatorContent(): JSX.Element {
        const type = this.props.refreshType;
        const jsx = [this.renderNormalContent()];

        return (
            <View style={Platform.OS === "ios" ? styles.pullRefresh : {
                width: Dimensions.get("window").width,
                height: this.loadMoreHeight,
            }}>

                {jsx.map((item, index) => {
                    return <View key={index}>{item}</View>;
                })}
            </View>
        );
    }

    public renderNormalContent(): any {
        this.transform = [{
            rotate: this.state.prArrowDeg.interpolate({
                inputRange: [0, 1],
                outputRange: ["0deg", "-180deg"],
            }),
        }];
        const jsxarr = [];
        let arrowStyle: StyleProp<ViewStyle> = {
            position: "absolute",
            width: 14,
            height: 23,
            left: -50,
            top: -4,
            transform: this.transform,
        };
        let indicatorStyle: StyleProp<ViewStyle> = {
            position: "absolute",
            left: -40,
            top: 2,
            width: 16,
            height: 16,
        };

        if (this.props.indicatorImg!.url) {
            if (this.props.indicatorImg!.style) {
                indicatorStyle = this.props.indicatorImg!.style;
            }
            if (this.state.prLoading) {
                jsxarr.push(<ImageBackground style={indicatorStyle} source={{ uri: this.props.indicatorImg!.url }}/>);
            } else {
                jsxarr.push(null);
            }
        } else if (this.state.prLoading) {
            // @ts-ignore
            jsxarr.push(<ActivityIndicator style={indicatorStyle} animated={true} color={"#488eff"}/>);
        } else {
            jsxarr.push(null);
        }

        if (this.props.indicatorArrowImg!.url) {
            if (this.props.indicatorArrowImg!.style) {
                arrowStyle = this.props.indicatorArrowImg!.style;
            }
            // @ts-ignore
            arrowStyle.transform = this.transform;
            if (!this.state.prLoading) {
                jsxarr.push(<Animated.Image style={arrowStyle} resizeMode={"contain"}
                                            source={{ uri: this.props.indicatorArrowImg!.url }}/>);
            } else {
                jsxarr.push(null);
            }
        } else if (!this.state.prLoading) {
            jsxarr.push(<Animated.Image style={arrowStyle} resizeMode={"contain"}
                                        source={{ uri: this.base64Icon }}/>);
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
                <Text style={styles.prText}>上次更新时间：{this.state.prTimeDisplay}</Text>
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
        const indicatorStyle = {
            position: "absolute",
            left: -40,
            top: -1,
            width: 16,
            height: 16,
        };

        jsx.push(<Text key={2} style={{ color: "#979aa0" }}>{this.state.loadTitle}</Text>);

        return jsx;
    }

    /**
     * 数据加载完成
     */
    public onLoadFinish(): void {
        this.setState({ loadTitle: this.props.endText! });
    }

    /**
     * 没有数据可加载
     */
    public onNoDataToLoad(): void {
        this.setState({ loadTitle: this.props.noDataText! });
    }

    /**
     * @function: 刷新结束
     */
    public onRefreshEnd(): void {
        const now = new Date().getTime();
        this.setState({
            prTitle: this.props.refreshText!,
            prLoading: false,
            beginScroll: false,
            prTimeDisplay: dateFormat(now, "yyyy-MM-dd hh:mm"),
        });

        // 存一下刷新时间
        AsyncStorage.setItem(this.prStoryKey, now.toString()).then();
        if (this._scrollViewRef) {
            if (Platform.OS === "ios") {
                this._scrollViewRef.scrollTo({ x: 0, y: 0, animated: true });
            } else if (Platform.OS === "android") {
                this._scrollViewRef.scrollTo({ x: 0, y: this.loadMoreHeight, animated: true });
            }
        }
    }

    // 高于临界值状态
    public upState(): void {
        this.setState({
            prTitle: this.props.refreshedText!,
            prState: 1,
        });

        Animated.timing(this.state.prArrowDeg, {
            toValue: 1,
            duration: 100,
            easing: Easing.inOut(Easing.quad),
        }).start();
    }

    // 低于临界值状态
    public downState(): void {
        this.setState({
            prTitle: this.props.refreshText!,
            prState: 0,
        });
        Animated.timing(this.state.prArrowDeg, {
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

    private _onScroll = (event?: NativeSyntheticEvent<NativeScrollEvent>): void => {
        if (event) {
            const contentOffset = event.nativeEvent.contentOffset;
            this._offset = this.props.isHorizontal ? contentOffset.x : contentOffset.y;
            this.props.onScroll(contentOffset.x, contentOffset.y, event);
        }

        // @ts-ignore
        const target = event.nativeEvent;
        const y = target.contentOffset.y;

        if (this.dragFlag) {
            if (Platform.OS === "ios") {
                if (y <= -70) {
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
            if (y === 0 &&
                Platform.OS === "android") {
                this.setState({
                    prTitle: this.props.refreshingText!,
                    prLoading: true,
                    prArrowDeg: new Animated.Value(0),

                });
                this.onRefreshEnd();
            }
        }
    };

    private _onLayout = (event: LayoutChangeEvent): void => {
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
        top: -69,
        left: 0,
        backfaceVisibility: "hidden",
        right: 0,
        height: 70,
        alignItems: "center",
        justifyContent: "flex-end",
    },
    loadMore: {
        height: 35,
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
