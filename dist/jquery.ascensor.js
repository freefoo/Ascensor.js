/*
Ascensor.js 
version: 1.6.5 (2013-10-15)
description: Ascensor is a jquery plugin which aims to train and adapt content according to an elevator system
repository: https://github.com/kirkas/Ascensor.js
license: BSD
author: Léo Galley <contact@kirkas.ch>
*/
(function($, window, document) {
    /*
    Create plugin instance
  */
    function Plugin(element, options) {
        this.element = element, this.options = $.extend({}, defaults, options), this._defaults = defaults, 
        this._name = pluginName, this.init();
    }
    var pluginName = "ascensor", defaults = {
        ascensorFloorName: null,
        childType: "div",
        windowsOn: 0,
        direction: "y",
        loop: !0,
        ascensorMap: "",
        time: "1000",
        easing: "linear",
        keyNavigation: !0,
        touchSwipeIntegration: !1,
        queued: !1
    };
    Plugin.prototype.init = function() {
        function resize() {
            WW = $window.width(), WH = $window.height(), nodeChildren.width(WW).height(WH), 
            node.width(WW).height(WH), "y" === self.options.direction && node.stop().scrollTop(floorActive * WH), 
            "x" === self.options.direction && (node.stop().scrollLeft(floorActive * WW), nodeChildren.each(function(index) {
                $(this).css("left", index * WW);
            })), "chocolate" === self.options.direction && (nodeChildren.each(function(index) {
                $(this).css({
                    left: self.options.ascensorMap[index][1] * WW,
                    top: self.options.ascensorMap[index][0] * WH
                });
            }), scrollToStage(floorActive, 1), node.stop().scrollLeft(self.options.ascensorMap[floorActive][1] * WW).scrollTop(self.options.ascensorMap[floorActive][0] * WH));
        }
        function handleDirection(direction) {
            if ("y" == self.options.direction) {
                if ("left" == direction) return;
                "down" == direction ? next() : "up" == direction && prev();
            } else if ("x" == self.options.direction) {
                if ("up" == direction) return;
                "left" == direction ? prev() : "right" == direction && next();
            } else "chocolate" == self.options.direction && ("down" == direction ? handleChocolateDirection(1, 0) : "up" == direction ? handleChocolateDirection(-1, 0) : "left" == direction ? handleChocolateDirection(0, -1) : "right" == direction && handleChocolateDirection(0, 1));
        }
        function prev() {
            var prevFloor = floorActive - 1;
            0 > prevFloor && (prevFloor = self.options.loop ? floorCounter : 0), scrollToStage(prevFloor, self.options.time);
        }
        function next() {
            var nextFloor = floorActive + 1;
            nextFloor > floorCounter && (nextFloor = self.options.loop ? 0 : floorCounter), 
            scrollToStage(nextFloor, self.options.time);
        }
        function handleChocolateDirection(addCoordY, addCoordX) {
            var floorReference = [ self.options.ascensorMap[floorActive][0] + addCoordY, self.options.ascensorMap[floorActive][1] + addCoordX ];
            $.each(self.options.ascensorMap, function(index) {
                "" + floorReference == "" + self.options.ascensorMap[index] && scrollToStage(index, self.options.time);
            });
        }
        function getFloorFromHash() {
            if (window.location.hash) {
                hash = window.location.hash.split("/").pop();
                var floor = !1;
                return $(self.options.ascensorFloorName).each(function(index) {
                    hash === self.options.ascensorFloorName[index] && (floor = index);
                }), floor;
            }
        }
        function scrollToStage(floor, time) {
            scrollStart(floorActive, floor);
            var animationParams = {
                time: time,
                easing: self.options.easing,
                callback: function() {
                    scrollEnd(floorActive, floor);
                }
            };
            if ("y" === self.options.direction) animationParams.property = {
                scrollTop: floor * WH
            }; else if ("x" === self.options.direction) animationParams.property = {
                scrollLeft: floor * WW
            }; else if ("chocolate" === self.options.direction && (animationParams.property = {
                scrollLeft: self.options.ascensorMap[floor][1] * WW,
                scrollTop: self.options.ascensorMap[floor][0] * WH
            }, self.options.queued)) {
                var sameXposition = node.scrollLeft() === self.options.ascensorMap[floor][1] * WW, sameYposition = node.scrollTop() === self.options.ascensorMap[floor][0] * WH;
                "x" === self.options.queued ? sameXposition ? animationParams.property = {
                    scrollTop: self.options.ascensorMap[floor][0] * WH
                } : (animationParams.property = {
                    scrollLeft: self.options.ascensorMap[floor][1] * WW
                }, animationParams.callback = function() {
                    node.stop().animate({
                        scrollTop: self.options.ascensorMap[floor][0] * WH
                    }, time, self.options.easing, function() {
                        scrollEnd(floorActive, floor);
                    });
                }) : "y" === self.options.queued && (sameYposition ? animationParams.property = {
                    scrollLeft: self.options.ascensorMap[floor][1] * WW
                } : (animationParams.property = {
                    scrollTop: self.options.ascensorMap[floor][0] * WH
                }, animationParams.callback = function() {
                    node.stop().animate({
                        scrollLeft: self.options.ascensorMap[floor][1] * WW
                    }, time, self.options.easing, function() {
                        scrollEnd(floorActive, floor);
                    });
                }));
            }
            node.stop().animate(animationParams.property, time, self.options.easing, animationParams.callback), 
            self.options.ascensorFloorName && (window.location.hash = "/" + self.options.ascensorFloorName[floor]), 
            floorActive = floor;
        }
        function scrollStart(from, to) {
            var floor = {
                from: from,
                to: to
            };
            node.trigger("scrollStart", floor);
        }
        function scrollEnd(from, to) {
            var floor = {
                from: from,
                to: to
            };
            node.trigger("scrollEnd", floor);
        }
        function checkKey(e) {
            if (!$("input, textarea, button").is(":focus")) switch (e.which) {
              case 40:
              case 83:
                handleDirection("down");
                break;

              case 38:
              case 87:
                handleDirection("up");
                break;

              case 37:
              case 65:
                handleDirection("left");
                break;

              case 39:
              case 68:
                handleDirection("right");
            }
        }
        var //height/width settings
        WW, WH, //hash 
        hash, self = this, node = $(this.element), nodeChildren = node.children(self.options.childType), //floor counter settings
        floorActive = self.options.windowsOn, floorCounter = -1, $document = (self.options.direction, 
        $(document)), $window = $(window);
        if (node.on("scrollToDirection", function(event, direction) {
            "next" == direction ? next() : "prev" == direction ? prev() : handleDirection(direction);
        }), node.on("scrollToStage", function(event, floor) {
            floor > floorCounter || scrollToStage(floor);
        }), node.on("next", function() {
            next();
        }), node.on("prev", function() {
            prev();
        }), node.on("update", function() {
            nodeChildren = node.children(self.options.childType), resize();
        }), node.css({
            position: "absolute"
        }), nodeChildren.each(function() {
            floorCounter += 1;
        }), ("x" === self.options.direction || "chocolate" === self.options.direction) && nodeChildren.css({
            position: "absolute",
            overflow: "auto"
        }), self.options.keyNavigation && $document.keydown(checkKey), self.options.ascensorFloorName && window.location.hash) {
            var hashFloor = getFloorFromHash();
            hashFloor && (floorActive = hashFloor);
        }
        scrollToStage(floorActive, 1, !0), self.options.touchSwipeIntegration && node.swipe({
            swipe: function(event, direction) {
                node.trigger("scrollToDirection", direction);
            },
            threshold: 70
        }), $window.resize(function() {
            resize();
        }).load(function() {
            resize();
        }).resize(), window.DeviceOrientationEvent && $window.bind("orientationchange", function() {
            resize();
        });
    }, $.fn[pluginName] = function(options) {
        return this.each(function() {
            $.data(this, "plugin_" + pluginName) || $.data(this, "plugin_" + pluginName, new Plugin(this, options));
        });
    };
})(jQuery, window, document);