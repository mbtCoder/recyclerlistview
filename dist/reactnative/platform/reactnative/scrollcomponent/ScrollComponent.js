"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ANDROID_REFRESHING_HEIGHT = exports.PULL_REFRESH_HEIGHT = void 0;
var React = require("react");
var react_native_1 = require("react-native");
var BaseScrollComponent_1 = require("../../../core/scrollcomponent/BaseScrollComponent");
var TSCast_1 = require("../../../utils/TSCast");
var async_storage_1 = require("@react-native-community/async-storage");
var ItemAnimator_1 = require("../../../core/ItemAnimator");
/***
 * The responsibility of a scroll component is to report its size, scroll events and provide a way to scroll to a given offset.
 * RecyclerListView works on top of this interface and doesn't care about the implementation. To support web we only had to provide
 * another component written on top of web elements
 */
var ScrollComponent = /** @class */ (function (_super) {
    __extends(ScrollComponent, _super);
    // private timer: NodeJS.Timeout;
    function ScrollComponent(args) {
        var _this = _super.call(this, args) || this;
        _this._scrollViewRef = null;
        _this._getScrollViewRef = function (scrollView) {
            _this._scrollViewRef = scrollView;
        };
        _this._onScroll = function (event) {
            if (event) {
                var contentOffset = event.nativeEvent.contentOffset;
                _this._offset = _this.props.isHorizontal ? contentOffset.x : contentOffset.y;
                _this.props.onScroll(contentOffset.x, contentOffset.y, event);
            }
            // 开启下拉刷新时执行
            if (!_this.props.isHorizontal && _this.props.onRefresh) {
                // @ts-ignore
                var target = event.nativeEvent;
                var y = target.contentOffset.y;
                if (_this.dragState) {
                    if (IOS) {
                        if (y <= ~exports.PULL_REFRESH_HEIGHT) {
                            _this.upState();
                        }
                        else {
                            _this.downState();
                        }
                    }
                    else if (ANDROID) {
                        if (y <= 10) {
                            _this.upState();
                        }
                        else {
                            _this.downState();
                        }
                    }
                }
                else {
                    // 用户快速滑动放手后 导致弹簧到顶部触发
                    if (y === 0 && ANDROID) {
                        _this.setState({
                            prTitle: _this.props.refreshLoadingText,
                            prLoading: true,
                            prArrowDeg: new react_native_1.Animated.Value(0),
                        });
                        _this.onRefreshEnd();
                    }
                }
            }
        };
        _this._onLayout = function (event) {
            if (_this._height !== event.nativeEvent.layout.height || _this._width !== event.nativeEvent.layout.width) {
                _this._height = event.nativeEvent.layout.height;
                _this._width = event.nativeEvent.layout.width;
                if (_this.props.onSizeChanged) {
                    _this._isSizeChangedCalledOnce = true;
                    _this.props.onSizeChanged(event.nativeEvent.layout);
                }
            }
            if (_this.props.onLayout) {
                _this.props.onLayout(event);
            }
        };
        _this._height = 0;
        _this._width = 0;
        _this._offset = 0;
        _this._isSizeChangedCalledOnce = false;
        /**
         * 下拉刷新&上拉加载
         */
        _this.state = {
            prTitle: ANDROID ? args.refreshLoadingText : args.refreshNormalText,
            loadTitle: args.loadMoreNormalText,
            prLoading: ANDROID,
            prArrowDeg: new react_native_1.Animated.Value(0),
            prTimeDisplay: "暂无更新",
            prState: 0,
        };
        _this.flag = args.flag;
        _this.prStorageKey = "prTimeKey";
        _this.arrowTransform = {
            transform: [{
                    rotate: "",
                }],
        };
        _this.dragState = false;
        // tslint:disable-next-line:max-line-length
        _this.defaultArrowIcon = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAABQBAMAAAD8TNiNAAAAJ1BMVEUAAACqqqplZWVnZ2doaGhqampoaGhpaWlnZ2dmZmZlZWVmZmZnZ2duD78kAAAADHRSTlMAA6CYqZOlnI+Kg/B86E+1AAAAhklEQVQ4y+2LvQ3CQAxGLSHEBSg8AAX0jECTnhFosgcjZKr8StE3VHz5EkeRMkF0rzk/P58k9rgOW78j+TE99OoeKpEbCvcPVDJ0OvsJ9bQs6Jxs26h5HCrlr9w8vi8zHphfmI0fcvO/ZXJG8wDzcvDFO2Y/AJj9ADE7gXmlxFMIyVpJ7DECzC9J2EC2ECAAAAAASUVORK5CYII=";
        _this._onScroll = _this._onScroll.bind(_this);
        _this._onLayout = _this._onLayout.bind(_this);
        return _this;
    }
    ScrollComponent.prototype.scrollTo = function (x, y, isAnimated) {
        if (this._scrollViewRef) {
            this._scrollViewRef.scrollTo({ x: x, y: y, animated: isAnimated });
        }
    };
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
    //             this.scrollTo({x: 0, y: PULL_REFRESH_HEIGHT, animated: true});
    //             this.timer && clearTimeout(this.timer);
    //         }, 1000);
    //     }
    //     this.flag = this.props.flag;
    // }
    // }
    ScrollComponent.prototype.render = function () {
        var _this = this;
        var Scroller = TSCast_1.default.cast(this.props.externalScrollView); //TSI
        var renderContentContainer = this.props.renderContentContainer ? this.props.renderContentContainer : this._defaultContainer;
        var contentContainerProps = {
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
        return (React.createElement(Scroller, __assign({ ref: this._getScrollViewRef, removeClippedSubviews: false, scrollEventThrottle: this.props.scrollThrottle }, this.props, { horizontal: this.props.isHorizontal, onScroll: this._onScroll, onLayout: (!this._isSizeChangedCalledOnce || this.props.canChangeSize) ? this._onLayout : this.props.onLayout, bounces: !!this.props.onRefresh, onScrollEndDrag: function (e) { return _this.onScrollEndDrag(e); }, onScrollBeginDrag: function (e) { return _this.onScrollBeginDrag(e); }, onMomentumScrollEnd: function (e) { return _this.onMomentumScrollEnd(e); } }),
            React.createElement(react_native_1.View, { style: { flexDirection: this.props.isHorizontal ? "row" : "column" } },
                !this.props.isHorizontal && this.props.onRefresh ? this.renderIndicatorModule() : null,
                React.createElement(react_native_1.View, { style: { height: this._getContentHeight(), width: this.props.contentWidth } }, renderContentContainer(contentContainerProps, this.props.children)),
                this.props.renderFooter ? this.props.renderFooter() : null,
                this.props.useLoadMore && this.props.onEndReached ? this.renderIndicatorContentBottom() : null)));
    };
    ScrollComponent.prototype.onMomentumScrollEnd = function (e) {
        // 回调给父级
        if (this.props.onMomentumScrollEnd) {
            this.props.onMomentumScrollEnd(e);
        }
        if (ANDROID) {
            var target = e.nativeEvent;
            var y = target.contentOffset.y;
            /**
             * 安卓
             * 用户拖拽后惯性滚动最后点位不足以触发刷新 归为到默认点
             */
            if (y <= exports.PULL_REFRESH_HEIGHT && y > exports.ANDROID_REFRESHING_HEIGHT) {
                this.scrollTo(0, exports.PULL_REFRESH_HEIGHT, true);
            }
        }
    };
    // 手指未离开
    ScrollComponent.prototype.onScrollBeginDrag = function (e) {
        // 回调给父级
        if (this.props.onScrollBeginDrag) {
            this.props.onScrollBeginDrag(e);
        }
        var target = e.nativeEvent;
        var y = target.contentOffset.y;
        this.dragState = true;
    };
    // 手指离开
    ScrollComponent.prototype.onScrollEndDrag = function (e) {
        // 回调给父级
        if (this.props.onScrollEndDrag) {
            this.props.onScrollEndDrag(e);
        }
        if (!this.props.isHorizontal && this.props.onRefresh) {
            var target = e.nativeEvent;
            var y = target.contentOffset.y;
            this.dragState = false;
            console.log("scrolll---最后拖拽点位----", y);
            /**
             * 安卓
             * 用户拖拽不足以触发刷新 归为到默认点
             */
            if (ANDROID && y <= exports.PULL_REFRESH_HEIGHT && y > exports.ANDROID_REFRESHING_HEIGHT) {
                this.scrollTo(0, exports.PULL_REFRESH_HEIGHT, true);
            }
            if (this.state.prState) {
                // ios固定到下拉刷新模块高度
                if (IOS) {
                    this.scrollTo(0, ~exports.PULL_REFRESH_HEIGHT, true);
                }
                this.setState({
                    prTitle: this.props.refreshLoadingText,
                    prLoading: true,
                    prArrowDeg: new react_native_1.Animated.Value(0),
                    prState: 0,
                });
                // 触发外部的下拉刷新
                this.props.onRefresh();
            }
        }
    };
    /**
     * 下拉刷新模块
     */
    ScrollComponent.prototype.renderIndicatorModule = function () {
        var type = this.props.refreshType;
        var jsx = [this.renderNormalContent()];
        return (React.createElement(react_native_1.View, { style: IOS ? styles.pullRefresh_ios : styles.pullRefresh_android }, jsx.map(function (item, index) {
            return React.createElement(react_native_1.View, { key: index }, item);
        })));
    };
    ScrollComponent.prototype.renderNormalContent = function () {
        this.arrowTransform = {
            transform: [{
                    rotate: this.state.prArrowDeg.interpolate({
                        inputRange: [0, 1],
                        outputRange: ["0deg", "-180deg"],
                    }),
                }],
        };
        var jsxarr = [];
        var arrowStyle = {
            position: "absolute",
            width: 14,
            height: 23,
            left: -50,
            top: -4,
            transform: this.arrowTransform.transform,
        };
        var indicatorStyle = {
            position: "absolute",
            left: -40,
            top: 2,
            width: 16,
            height: 16,
        };
        if (this.props.indicatorImg.url) {
            if (Object.keys(this.props.indicatorImg.style).length === 0) {
                indicatorStyle = this.props.indicatorImg.style;
            }
            if (this.state.prLoading) {
                jsxarr.push(React.createElement(react_native_1.ImageBackground, { style: indicatorStyle, source: { uri: this.props.indicatorImg.url } }));
            }
            else {
                jsxarr.push(null);
            }
        }
        else if (this.state.prLoading) {
            jsxarr.push(React.createElement(react_native_1.ActivityIndicator, { style: indicatorStyle, animating: true, color: "#488eff" }));
        }
        else {
            jsxarr.push(null);
        }
        if (this.props.indicatorArrowImg.url) {
            // 如果传了箭头样式
            if (Object.keys(this.props.indicatorArrowImg.style).length === 0) {
                arrowStyle = this.props.indicatorArrowImg.style;
            }
            arrowStyle.transform = this.arrowTransform.transform;
            if (!this.state.prLoading) {
                jsxarr.push(React.createElement(react_native_1.Animated.Image, { style: arrowStyle, resizeMode: "contain", source: { uri: this.props.indicatorArrowImg.url } }));
            }
            else {
                jsxarr.push(null);
            }
        }
        else if (!this.state.prLoading) {
            jsxarr.push(React.createElement(react_native_1.Animated.Image, { style: arrowStyle, resizeMode: "contain", source: { uri: this.defaultArrowIcon } }));
        }
        else {
            jsxarr.push(null);
        }
        jsxarr.push(React.createElement(react_native_1.Text, { style: styles.prState }, this.state.prTitle));
        return (React.createElement(react_native_1.View, { style: { alignItems: "center" } },
            React.createElement(react_native_1.View, { style: styles.indicatorContent }, jsxarr.map(function (item, index) {
                return React.createElement(react_native_1.View, { key: index }, item);
            })),
            React.createElement(react_native_1.Text, { style: styles.prText },
                "\u4E0A\u6B21\u66F4\u65B0\uFF1A",
                this.state.prTimeDisplay)));
    };
    ScrollComponent.prototype.renderIndicatorContentBottom = function () {
        var jsx = [this.renderBottomContent()];
        return (React.createElement(react_native_1.View, { style: styles.loadMore }, jsx.map(function (item, index) {
            return React.createElement(react_native_1.View, { key: index }, item);
        })));
    };
    ScrollComponent.prototype.renderBottomContent = function () {
        var jsx = [];
        var indicatorStyle = {
            position: "absolute",
            left: -50,
            top: -1,
            width: 16,
            height: 16,
        };
        if (this.state.loadTitle === this.props.loadMoreLoadingText) {
            jsx.push(React.createElement(react_native_1.ActivityIndicator, { key: "bottom_activityIndicator", style: indicatorStyle, animating: true, color: "#488eff" }));
        }
        jsx.push(React.createElement(react_native_1.Text, { key: 2, style: { color: "#979aa0" } }, this.state.loadTitle));
        return jsx;
    };
    /**
     *  上拉加载正常状态
     */
    ScrollComponent.prototype.onLoadNormal = function () {
        this.setState({ loadTitle: this.props.loadMoreNormalText });
    };
    /**
     * 上拉加载更多
     */
    ScrollComponent.prototype.onLoadingMore = function () {
        this.setState({ loadTitle: this.props.loadMoreLoadingText });
    };
    /**
     * 没有数据可加载
     */
    ScrollComponent.prototype.onNoDataToLoad = function () {
        this.setState({ loadTitle: this.props.loadMoreNoDataText });
    };
    /**
     * @function: 刷新结束
     */
    ScrollComponent.prototype.onRefreshEnd = function () {
        var now = new Date().getTime();
        this.setState({
            prTitle: this.props.refreshNormalText,
            prLoading: false,
            prTimeDisplay: dateFormat(now, "yyyy-MM-dd hh:mm"),
        });
        // 存一下刷新时间
        async_storage_1.default.setItem(this.prStorageKey, now.toString());
        if (IOS) {
            this.scrollTo(0, 0, true);
        }
        else if (ANDROID) {
            this.scrollTo(0, exports.PULL_REFRESH_HEIGHT, true);
        }
    };
    /**
     * @function: 刷新开始
     */
    ScrollComponent.prototype.onRefreshing = function () {
        if (!this.props.isHorizontal && this.props.onRefresh) {
            this.setState({
                prTitle: this.props.refreshLoadingText,
                prLoading: true,
                prArrowDeg: new react_native_1.Animated.Value(0),
            });
            if (IOS) {
                console.log("RCL IOS 开始变成刷新状态");
                this.scrollTo(0, ~exports.PULL_REFRESH_HEIGHT, true);
            }
            else {
                this.scrollTo(0, exports.ANDROID_REFRESHING_HEIGHT, true);
            }
            this.props.onRefresh();
        }
    };
    // 高于临界值状态
    ScrollComponent.prototype.upState = function () {
        this.setState({
            prTitle: this.props.refreshReleaseText,
            prState: 1,
        });
        react_native_1.Animated.timing(this.state.prArrowDeg, {
            useNativeDriver: ItemAnimator_1.BaseItemAnimator.USE_NATIVE_DRIVER,
            toValue: 1,
            duration: 100,
            easing: react_native_1.Easing.inOut(react_native_1.Easing.quad),
        }).start();
    };
    // 低于临界值状态
    ScrollComponent.prototype.downState = function () {
        this.setState({
            prTitle: this.props.refreshNormalText,
            prState: 0,
        });
        react_native_1.Animated.timing(this.state.prArrowDeg, {
            useNativeDriver: ItemAnimator_1.BaseItemAnimator.USE_NATIVE_DRIVER,
            toValue: 0,
            duration: 100,
            easing: react_native_1.Easing.inOut(react_native_1.Easing.quad),
        }).start();
    };
    ScrollComponent.prototype._getContentHeight = function () {
        var height = SCREEN_HEIGHT;
        if (this.props.dataProvider.getSize() > 0) {
            height = this.props.dataProvider.getAllData()[0] === "NO_DATA_PROVIDER" ? this._height : this.props.contentHeight;
        }
        return height;
    };
    ScrollComponent.prototype._defaultContainer = function (props, children) {
        return (React.createElement(react_native_1.View, __assign({}, props), children));
    };
    ScrollComponent.defaultProps = {
        contentHeight: 0,
        contentWidth: 0,
        externalScrollView: TSCast_1.default.cast(react_native_1.ScrollView),
        isHorizontal: false,
        scrollThrottle: 16,
    };
    return ScrollComponent;
}(BaseScrollComponent_1.default));
exports.default = ScrollComponent;
exports.PULL_REFRESH_HEIGHT = 60;
exports.ANDROID_REFRESHING_HEIGHT = 0.5;
var NO_DATA_PROVIDER = "NO_DATA_PROVIDER";
var SCREEN_WIDTH = react_native_1.Dimensions.get("window").width;
var SCREEN_HEIGHT = react_native_1.Dimensions.get("window").height;
var ANDROID = react_native_1.Platform.OS === "android";
var IOS = react_native_1.Platform.OS === "ios";
var dateFormat = function (dateTime, fmt) {
    var date = new Date(dateTime);
    var tmp = fmt || "yyyy-MM-dd";
    var o = {
        "M+": date.getMonth() + 1,
        "d+": date.getDate(),
        "h+": date.getHours(),
        "m+": date.getMinutes(),
        "s+": date.getSeconds(),
        "q+": Math.floor((date.getMonth() + 3) / 3),
        "S": date.getMilliseconds(),
    };
    if (/(y+)/.test(tmp)) {
        tmp = tmp.replace(RegExp.$1, (String(date.getFullYear())).substr(4 - RegExp.$1.length));
    }
    for (var k in o) {
        if (new RegExp("(" + k + ")").test(tmp)) {
            // @ts-ignore
            tmp = tmp.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (("00" + o[k]).substr((String(o[k])).length)));
        }
    }
    return tmp;
};
var styles = react_native_1.StyleSheet.create({
    pullRefresh_ios: {
        position: "absolute",
        top: ~exports.PULL_REFRESH_HEIGHT,
        left: 0,
        backfaceVisibility: "hidden",
        right: 0,
        height: exports.PULL_REFRESH_HEIGHT,
        alignItems: "center",
        justifyContent: "center",
    },
    pullRefresh_android: {
        width: SCREEN_WIDTH,
        height: exports.PULL_REFRESH_HEIGHT,
        justifyContent: "center",
    },
    loadMore: {
        height: 35,
        marginBottom: 10,
        alignItems: "center",
        justifyContent: "center",
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
    indicatorContent: {
        flexDirection: "row",
        marginBottom: 5,
    },
});
//# sourceMappingURL=ScrollComponent.js.map