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
var React = require("react");
var react_native_1 = require("react-native");
var BaseScrollComponent_1 = require("../../../core/scrollcomponent/BaseScrollComponent");
var TSCast_1 = require("../../../utils/TSCast");
/***
 * The responsibility of a scroll component is to report its size, scroll events and provide a way to scroll to a given offset.
 * RecyclerListView works on top of this interface and doesn't care about the implementation. To support web we only had to provide
 * another component written on top of web elements
 */
var ScrollComponent = /** @class */ (function (_super) {
    __extends(ScrollComponent, _super);
    function ScrollComponent(args) {
        var _this = _super.call(this, args) || this;
        _this._scrollViewRef = null;
        /**
         * 上拉加载&下拉刷新
         */
        _this._dummyOnLayout = TSCast_1.default.cast(null);
        _this._getScrollViewRef = function (scrollView) {
            _this._scrollViewRef = scrollView;
        };
        _this._onScroll = function (event) {
            if (event) {
                var contentOffset = event.nativeEvent.contentOffset;
                _this._offset = _this.props.isHorizontal ? contentOffset.x : contentOffset.y;
                _this.props.onScroll(contentOffset.x, contentOffset.y, event);
            }
            // @ts-ignore
            var target = event.nativeEvent;
            var y = target.contentOffset.y;
            if (_this.dragFlag) {
                if (react_native_1.Platform.OS === "ios") {
                    if (y <= -70) {
                        _this.upState();
                    }
                    else {
                        _this.downState();
                    }
                }
                else if (react_native_1.Platform.OS === "android") {
                    if (y <= 10) {
                        _this.upState();
                    }
                    else {
                        _this.downState();
                    }
                }
            }
            else {
                if (y === 0 &&
                    react_native_1.Platform.OS === "android") {
                    _this.setState({
                        prTitle: _this.props.refreshingText,
                        prLoading: true,
                        prArrowDeg: new react_native_1.Animated.Value(0),
                    });
                    _this.onRefreshEnd();
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
            prTitle: args.refreshText,
            loadTitle: args.endingText,
            prLoading: false,
            prArrowDeg: new react_native_1.Animated.Value(0),
            prTimeDisplay: "暂无更新",
            beginScroll: null,
            prState: 0,
        };
        _this.flag = args.flag;
        _this.prStoryKey = "prtimekey";
        _this.loadMoreHeight = 60;
        _this.dragFlag = false; //scrollview是否处于拖动状态的标志
        // tslint:disable-next-line:max-line-length
        _this.base64Icon = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAABQBAMAAAD8TNiNAAAAJ1BMVEUAAACqqqplZWVnZ2doaGhqampoaGhpaWlnZ2dmZmZlZWVmZmZnZ2duD78kAAAADHRSTlMAA6CYqZOlnI+Kg/B86E+1AAAAhklEQVQ4y+2LvQ3CQAxGLSHEBSg8AAX0jECTnhFosgcjZKr8StE3VHz5EkeRMkF0rzk/P58k9rgOW78j+TE99OoeKpEbCvcPVDJ0OvsJ9bQs6Jxs26h5HCrlr9w8vi8zHphfmI0fcvO/ZXJG8wDzcvDFO2Y/AJj9ADE7gXmlxFMIyVpJ7DECzC9J2EC2ECAAAAAASUVORK5CYII=";
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
    ScrollComponent.prototype.componentDidMount = function () {
        var _this = this;
        if (react_native_1.Platform.OS === "android" &&
            this.props.onRefresh) {
            this.setState({
                prTitle: this.props.refreshingText,
                prLoading: true,
                prArrowDeg: new react_native_1.Animated.Value(0),
            });
            this.timer = setTimeout(function () {
                if (_this._scrollViewRef) {
                    _this._scrollViewRef.scrollTo({ x: 0, y: _this.loadMoreHeight, animated: true });
                }
                if (_this.timer) {
                    clearTimeout(_this.timer);
                }
            }, 1000);
        }
    };
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
        return (React.createElement(Scroller, __assign({ ref: this._getScrollViewRef, removeClippedSubviews: false, scrollEventThrottle: this.props.scrollThrottle }, this.props, { horizontal: this.props.isHorizontal, onScroll: this._onScroll, onLayout: (!this._isSizeChangedCalledOnce || this.props.canChangeSize) ? this._onLayout : this.props.onLayout, bounces: !!this.props.onRefresh, onScrollEndDrag: function (e) { return _this.onScrollEndDrag(e); }, onScrollBeginDrag: function () { return _this.onScrollBeginDrag(); }, onMomentumScrollEnd: function (e) {
                if (react_native_1.Platform.OS === "android") {
                    var target = e.nativeEvent;
                    var y = target.contentOffset.y;
                    if (y <= _this.loadMoreHeight) {
                        _this.setState({
                            prTitle: _this.props.refreshingText,
                            prLoading: true,
                            prArrowDeg: new react_native_1.Animated.Value(0),
                        });
                    }
                }
            } }),
            React.createElement(react_native_1.View, { style: { flexDirection: this.props.isHorizontal ? "row" : "column" } },
                this.props.onRefresh ?
                    this.renderIndicatorContent() :
                    null,
                React.createElement(react_native_1.View, { style: {
                        // tslint:disable-next-line:max-line-length
                        height: react_native_1.Platform.OS === "ios" ? this.props.contentHeight : (react_native_1.Dimensions.get("window").height - this.props.contentHeight < 0 ? this.props.contentHeight : react_native_1.Dimensions.get("window").height),
                        width: this.props.contentWidth,
                    } }, renderContentContainer(contentContainerProps, this.props.children)),
                this.props.renderFooter ? this.props.renderFooter() : null,
                this.props.onEndReached ? this.renderIndicatorContentBottom() : null)));
    };
    // 手指未离开
    ScrollComponent.prototype.onScrollBeginDrag = function () {
        this.setState({
            beginScroll: true,
        });
        this.dragFlag = true;
        if (this.props.onScrollBeginDrag) {
            this.props.onScrollBeginDrag();
        }
    };
    // 手指离开
    ScrollComponent.prototype.onScrollEndDrag = function (e) {
        if (this._scrollViewRef) {
            var target = e.nativeEvent;
            var y = target.contentOffset.y;
            this.dragFlag = false;
            if (y <= this.loadMoreHeight && y >= 10 && react_native_1.Platform.OS === "android") {
                this._scrollViewRef.scrollTo({ x: 0, y: this.loadMoreHeight, animated: true });
            }
            if (this.state.prState) {
                // 回到待收起状态
                this._scrollViewRef.scrollTo({ x: 0, y: -70, animated: true });
                this.setState({
                    prTitle: this.props.refreshingText,
                    prLoading: true,
                    prArrowDeg: new react_native_1.Animated.Value(0),
                    prState: 0,
                });
                // 触发外部的下拉刷新方法
                if (this.props.onRefresh) {
                    // @ts-ignore
                    this.props.onRefresh(this);
                }
            }
        }
    };
    ScrollComponent.prototype.renderIndicatorContent = function () {
        var type = this.props.refreshType;
        var jsx = [this.renderNormalContent()];
        return (React.createElement(react_native_1.View, { style: react_native_1.Platform.OS === "ios" ? styles.pullRefresh : {
                width: react_native_1.Dimensions.get("window").width,
                height: this.loadMoreHeight,
            } }, jsx.map(function (item, index) {
            return React.createElement(react_native_1.View, { key: index }, item);
        })));
    };
    ScrollComponent.prototype.renderNormalContent = function () {
        this.transform = [{
                rotate: this.state.prArrowDeg.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["0deg", "-180deg"],
                }),
            }];
        var jsxarr = [];
        var arrowStyle = {
            position: "absolute",
            width: 14,
            height: 23,
            left: -50,
            top: -4,
            transform: this.transform,
        };
        var indicatorStyle = {
            position: "absolute",
            left: -40,
            top: 2,
            width: 16,
            height: 16,
        };
        if (this.props.indicatorImg.url) {
            if (this.props.indicatorImg.style) {
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
            // @ts-ignore
            jsxarr.push(React.createElement(react_native_1.ActivityIndicator, { style: indicatorStyle, animated: true, color: "#488eff" }));
        }
        else {
            jsxarr.push(null);
        }
        if (this.props.indicatorArrowImg.url) {
            if (this.props.indicatorArrowImg.style) {
                arrowStyle = this.props.indicatorArrowImg.style;
            }
            // @ts-ignore
            arrowStyle.transform = this.transform;
            if (!this.state.prLoading) {
                jsxarr.push(React.createElement(react_native_1.Animated.Image, { style: arrowStyle, resizeMode: "contain", source: { uri: this.props.indicatorArrowImg.url } }));
            }
            else {
                jsxarr.push(null);
            }
        }
        else if (!this.state.prLoading) {
            jsxarr.push(React.createElement(react_native_1.Animated.Image, { style: arrowStyle, resizeMode: "contain", source: { uri: this.base64Icon } }));
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
                "\u4E0A\u6B21\u66F4\u65B0\u65F6\u95F4\uFF1A",
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
            left: -40,
            top: -1,
            width: 16,
            height: 16,
        };
        jsx.push(React.createElement(react_native_1.Text, { key: 2, style: { color: "#979aa0" } }, this.state.loadTitle));
        return jsx;
    };
    /**
     * 数据加载完成
     */
    ScrollComponent.prototype.onLoadFinish = function () {
        this.setState({ loadTitle: this.props.endText });
    };
    /**
     * 没有数据可加载
     */
    ScrollComponent.prototype.onNoDataToLoad = function () {
        this.setState({ loadTitle: this.props.noDataText });
    };
    /**
     * @function: 刷新结束
     */
    ScrollComponent.prototype.onRefreshEnd = function () {
        var now = new Date().getTime();
        this.setState({
            prTitle: this.props.refreshText,
            prLoading: false,
            beginScroll: false,
            prTimeDisplay: dateFormat(now, "yyyy-MM-dd hh:mm"),
        });
        // 存一下刷新时间
        react_native_1.AsyncStorage.setItem(this.prStoryKey, now.toString()).then();
        if (this._scrollViewRef) {
            if (react_native_1.Platform.OS === "ios") {
                this._scrollViewRef.scrollTo({ x: 0, y: 0, animated: true });
            }
            else if (react_native_1.Platform.OS === "android") {
                this._scrollViewRef.scrollTo({ x: 0, y: this.loadMoreHeight, animated: true });
            }
        }
    };
    // 高于临界值状态
    ScrollComponent.prototype.upState = function () {
        this.setState({
            prTitle: this.props.refreshedText,
            prState: 1,
        });
        react_native_1.Animated.timing(this.state.prArrowDeg, {
            toValue: 1,
            duration: 100,
            easing: react_native_1.Easing.inOut(react_native_1.Easing.quad),
        }).start();
    };
    // 低于临界值状态
    ScrollComponent.prototype.downState = function () {
        this.setState({
            prTitle: this.props.refreshText,
            prState: 0,
        });
        react_native_1.Animated.timing(this.state.prArrowDeg, {
            toValue: 0,
            duration: 100,
            easing: react_native_1.Easing.inOut(react_native_1.Easing.quad),
        }).start();
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
//# sourceMappingURL=ScrollComponent.js.map