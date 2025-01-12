! function() {
    function only_once(fn) {
        var called = !1;
        return function() {
            if (called) throw new Error(wp_way2_regen_msgs.call_bk);
            called = !0, fn.apply(root, arguments)
        }
    }
    var root, previous_async, async = {};
    root = this, null != root && (previous_async = root.async), async.noConflict = function() {
        return root.async = previous_async, async
    };
    var _each = function(arr, iterator) {
            if (arr.forEach) return arr.forEach(iterator);
            for (var i = 0; i < arr.length; i += 1) iterator(arr[i], i, arr)
        },
        _map = function(arr, iterator) {
            if (arr.map) return arr.map(iterator);
            var results = [];
            return _each(arr, function(x, i, a) {
                results.push(iterator(x, i, a))
            }), results
        },
        _reduce = function(arr, iterator, memo) {
            return arr.reduce ? arr.reduce(iterator, memo) : (_each(arr, function(x, i, a) {
                memo = iterator(memo, x, i, a)
            }), memo)
        },
        _keys = function(obj) {
            if (Object.keys) return Object.keys(obj);
            var keys = [];
            for (var k in obj) obj.hasOwnProperty(k) && keys.push(k);
            return keys
        };
    "undefined" != typeof process && process.nextTick ? (async.nextTick = process.nextTick, "undefined" != typeof setImmediate ? async.setImmediate = function(fn) {
        setImmediate(fn)
    } : async.setImmediate = async.nextTick) : "function" == typeof setImmediate ? (async.nextTick = function(fn) {
        setImmediate(fn)
    }, async.setImmediate = async.nextTick) : (async.nextTick = function(fn) {
        setTimeout(fn, 0)
    }, async.setImmediate = async.nextTick), async.each = function(arr, iterator, callback) {
        if (callback = callback || function() {}, !arr.length) return callback();
        var completed = 0;
        _each(arr, function(x) {
            iterator(x, only_once(function(err) {
                err ? (callback(err), callback = function() {}) : (completed += 1, completed >= arr.length && callback(null))
            }))
        })
    }, async.forEach = async.each, async.eachSeries = function(arr, iterator, callback) {
        if (callback = callback || function() {}, !arr.length) return callback();
        var completed = 0,
            iterate = function() {
                iterator(arr[completed], function(err) {
                    err ? (callback(err), callback = function() {}) : (completed += 1, completed >= arr.length ? callback(null) : iterate())
                })
            };
        iterate()
    }, async.forEachSeries = async.eachSeries, async.eachLimit = function(arr, limit, iterator, callback) {
        var fn = _eachLimit(limit);
        fn.apply(null, [arr, iterator, callback])
    }, async.forEachLimit = async.eachLimit;
    var _eachLimit = function(limit) {
            return function(arr, iterator, callback) {
                if (callback = callback || function() {}, !arr.length || 0 >= limit) return callback();
                var completed = 0,
                    started = 0,
                    running = 0;
                ! function replenish() {
                    if (completed >= arr.length) return callback();
                    for (; limit > running && started < arr.length;) started += 1, running += 1, iterator(arr[started - 1], function(err) {
                        err ? (callback(err), callback = function() {}) : (completed += 1, running -= 1, completed >= arr.length ? callback() : replenish())
                    })
                }()
            }
        },
        doParallel = function(fn) {
            return function() {
                var args = Array.prototype.slice.call(arguments);
                return fn.apply(null, [async.each].concat(args))
            }
        },
        doParallelLimit = function(limit, fn) {
            return function() {
                var args = Array.prototype.slice.call(arguments);
                return fn.apply(null, [_eachLimit(limit)].concat(args))
            }
        },
        doSeries = function(fn) {
            return function() {
                var args = Array.prototype.slice.call(arguments);
                return fn.apply(null, [async.eachSeries].concat(args))
            }
        },
        _asyncMap = function(eachfn, arr, iterator, callback) {
            var results = [];
            arr = _map(arr, function(x, i) {
                return {
                    index: i,
                    value: x
                }
            }), eachfn(arr, function(x, callback) {
                iterator(x.value, function(err, v) {
                    results[x.index] = v, callback(err)
                })
            }, function(err) {
                callback(err, results)
            })
        };
    async.map = doParallel(_asyncMap), async.mapSeries = doSeries(_asyncMap), async.mapLimit = function(arr, limit, iterator, callback) {
        return _mapLimit(limit)(arr, iterator, callback)
    };
    var _mapLimit = function(limit) {
        return doParallelLimit(limit, _asyncMap)
    };
    async.reduce = function(arr, memo, iterator, callback) {
        async.eachSeries(arr, function(x, callback) {
            iterator(memo, x, function(err, v) {
                memo = v, callback(err)
            })
        }, function(err) {
            callback(err, memo)
        })
    }, async.inject = async.reduce, async.foldl = async.reduce, async.reduceRight = function(arr, memo, iterator, callback) {
        var reversed = _map(arr, function(x) {
            return x
        }).reverse();
        async.reduce(reversed, memo, iterator, callback)
    }, async.foldr = async.reduceRight;
    var _filter = function(eachfn, arr, iterator, callback) {
        var results = [];
        arr = _map(arr, function(x, i) {
            return {
                index: i,
                value: x
            }
        }), eachfn(arr, function(x, callback) {
            iterator(x.value, function(v) {
                v && results.push(x), callback()
            })
        }, function(err) {
            callback(_map(results.sort(function(a, b) {
                return a.index - b.index
            }), function(x) {
                return x.value
            }))
        })
    };
    async.filter = doParallel(_filter), async.filterSeries = doSeries(_filter), async.select = async.filter, async.selectSeries = async.filterSeries;
    var _reject = function(eachfn, arr, iterator, callback) {
        var results = [];
        arr = _map(arr, function(x, i) {
            return {
                index: i,
                value: x
            }
        }), eachfn(arr, function(x, callback) {
            iterator(x.value, function(v) {
                v || results.push(x), callback()
            })
        }, function(err) {
            callback(_map(results.sort(function(a, b) {
                return a.index - b.index
            }), function(x) {
                return x.value
            }))
        })
    };
    async.reject = doParallel(_reject), async.rejectSeries = doSeries(_reject);
    var _detect = function(eachfn, arr, iterator, main_callback) {
        eachfn(arr, function(x, callback) {
            iterator(x, function(result) {
                result ? (main_callback(x), main_callback = function() {}) : callback()
            })
        }, function(err) {
            main_callback()
        })
    };
    async.detect = doParallel(_detect), async.detectSeries = doSeries(_detect), async.some = function(arr, iterator, main_callback) {
        async.each(arr, function(x, callback) {
            iterator(x, function(v) {
                v && (main_callback(!0), main_callback = function() {}), callback()
            })
        }, function(err) {
            main_callback(!1)
        })
    }, async.any = async.some, async.every = function(arr, iterator, main_callback) {
        async.each(arr, function(x, callback) {
            iterator(x, function(v) {
                v || (main_callback(!1), main_callback = function() {}), callback()
            })
        }, function(err) {
            main_callback(!0)
        })
    }, async.all = async.every, async.sortBy = function(arr, iterator, callback) {
        async.map(arr, function(x, callback) {
            iterator(x, function(err, criteria) {
                err ? callback(err) : callback(null, {
                    value: x,
                    criteria: criteria
                })
            })
        }, function(err, results) {
            if (err) return callback(err);
            var fn = function(left, right) {
                var a = left.criteria,
                    b = right.criteria;
                return b > a ? -1 : a > b ? 1 : 0
            };
            callback(null, _map(results.sort(fn), function(x) {
                return x.value
            }))
        })
    }, async.auto = function(tasks, callback) {
        callback = callback || function() {};
        var keys = _keys(tasks);
        if (!keys.length) return callback(null);
        var results = {},
            listeners = [],
            addListener = function(fn) {
                listeners.unshift(fn)
            },
            removeListener = function(fn) {
                for (var i = 0; i < listeners.length; i += 1)
                    if (listeners[i] === fn) return void listeners.splice(i, 1)
            },
            taskComplete = function() {
                _each(listeners.slice(0), function(fn) {
                    fn()
                })
            };
        addListener(function() {
            _keys(results).length === keys.length && (callback(null, results), callback = function() {})
        }), _each(keys, function(k) {
            var task = tasks[k] instanceof Function ? [tasks[k]] : tasks[k],
                taskCallback = function(err) {
                    var args = Array.prototype.slice.call(arguments, 1);
                    if (args.length <= 1 && (args = args[0]), err) {
                        var safeResults = {};
                        _each(_keys(results), function(rkey) {
                            safeResults[rkey] = results[rkey]
                        }), safeResults[k] = args, callback(err, safeResults), callback = function() {}
                    } else results[k] = args, async.setImmediate(taskComplete)
                },
                requires = task.slice(0, Math.abs(task.length - 1)) || [],
                ready = function() {
                    return _reduce(requires, function(a, x) {
                        return a && results.hasOwnProperty(x)
                    }, !0) && !results.hasOwnProperty(k)
                };
            if (ready()) task[task.length - 1](taskCallback, results);
            else {
                var listener = function() {
                    ready() && (removeListener(listener), task[task.length - 1](taskCallback, results))
                };
                addListener(listener)
            }
        })
    }, async.waterfall = function(tasks, callback) {
        if (callback = callback || function() {}, tasks.constructor !== Array) {
            var err = new Error("First argument to waterfall must be an array of functions");
            return callback(err)
        }
        if (!tasks.length) return callback();
        var wrapIterator = function(iterator) {
            return function(err) {
                if (err) callback.apply(null, arguments), callback = function() {};
                else {
                    var args = Array.prototype.slice.call(arguments, 1),
                        next = iterator.next();
                    args.push(next ? wrapIterator(next) : callback), async.setImmediate(function() {
                        iterator.apply(null, args)
                    })
                }
            }
        };
        wrapIterator(async.iterator(tasks))()
    };
    var _parallel = function(eachfn, tasks, callback) {
        if (callback = callback || function() {}, tasks.constructor === Array) eachfn.map(tasks, function(fn, callback) {
            fn && fn(function(err) {
                var args = Array.prototype.slice.call(arguments, 1);
                args.length <= 1 && (args = args[0]), callback.call(null, err, args)
            })
        }, callback);
        else {
            var results = {};
            eachfn.each(_keys(tasks), function(k, callback) {
                tasks[k](function(err) {
                    var args = Array.prototype.slice.call(arguments, 1);
                    args.length <= 1 && (args = args[0]), results[k] = args, callback(err)
                })
            }, function(err) {
                callback(err, results)
            })
        }
    };
    async.parallel = function(tasks, callback) {
        _parallel({
            map: async.map,
            each: async.each
        }, tasks, callback)
    }, async.parallelLimit = function(tasks, limit, callback) {
        _parallel({
            map: _mapLimit(limit),
            each: _eachLimit(limit)
        }, tasks, callback)
    }, async.series = function(tasks, callback) {
        if (callback = callback || function() {}, tasks.constructor === Array) async.mapSeries(tasks, function(fn, callback) {
            fn && fn(function(err) {
                var args = Array.prototype.slice.call(arguments, 1);
                args.length <= 1 && (args = args[0]), callback.call(null, err, args)
            })
        }, callback);
        else {
            var results = {};
            async.eachSeries(_keys(tasks), function(k, callback) {
                tasks[k](function(err) {
                    var args = Array.prototype.slice.call(arguments, 1);
                    args.length <= 1 && (args = args[0]), results[k] = args, callback(err)
                })
            }, function(err) {
                callback(err, results)
            })
        }
    }, async.iterator = function(tasks) {
        var makeCallback = function(index) {
            var fn = function() {
                return tasks.length && tasks[index].apply(null, arguments), fn.next()
            };
            return fn.next = function() {
                return index < tasks.length - 1 ? makeCallback(index + 1) : null
            }, fn
        };
        return makeCallback(0)
    }, async.apply = function(fn) {
        var args = Array.prototype.slice.call(arguments, 1);
        return function() {
            return fn.apply(null, args.concat(Array.prototype.slice.call(arguments)))
        }
    };
    var _concat = function(eachfn, arr, fn, callback) {
        var r = [];
        eachfn(arr, function(x, cb) {
            fn(x, function(err, y) {
                r = r.concat(y || []), cb(err)
            })
        }, function(err) {
            callback(err, r)
        })
    };
    async.concat = doParallel(_concat), async.concatSeries = doSeries(_concat), async.whilst = function(test, iterator, callback) {
        test() ? iterator(function(err) {
            return err ? callback(err) : void async.whilst(test, iterator, callback)
        }) : callback()
    }, async.doWhilst = function(iterator, test, callback) {
        iterator(function(err) {
            return err ? callback(err) : void(test() ? async.doWhilst(iterator, test, callback) : callback())
        })
    }, async.until = function(test, iterator, callback) {
        test() ? callback() : iterator(function(err) {
            return err ? callback(err) : void async.until(test, iterator, callback)
        })
    }, async.doUntil = function(iterator, test, callback) {
        iterator(function(err) {
            return err ? callback(err) : void(test() ? callback() : async.doUntil(iterator, test, callback))
        })
    }, async.queue = function(worker, concurrency) {
        function _insert(q, data, pos, callback) {
            data.constructor !== Array && (data = [data]), _each(data, function(task) {
                var item = {
                    data: task,
                    callback: "function" == typeof callback ? callback : null
                };
                pos ? q.tasks.unshift(item) : q.tasks.push(item), q.saturated && q.tasks.length === concurrency && q.saturated(), async.setImmediate(q.process)
            })
        }
        void 0 === concurrency && (concurrency = 1);
        var workers = 0,
            q = {
                tasks: [],
                concurrency: concurrency,
                saturated: null,
                empty: null,
                drain: null,
                push: function(data, callback) {
                    _insert(q, data, !1, callback)
                },
                unshift: function(data, callback) {
                    _insert(q, data, !0, callback)
                },
                process: function() {
                    if (workers < q.concurrency && q.tasks.length) {
                        var task = q.tasks.shift();
                        q.empty && 0 === q.tasks.length && q.empty(), workers += 1;
                        var next = function() {
                                workers -= 1, task.callback && task.callback.apply(task, arguments), q.drain && q.tasks.length + workers === 0 && q.drain(), q.process()
                            },
                            cb = only_once(next);
                        worker(task.data, cb)
                    }
                },
                length: function() {
                    return q.tasks.length
                },
                running: function() {
                    return workers
                }
            };
        return q
    }, async.cargo = function(worker, payload) {
        var working = !1,
            tasks = [],
            cargo = {
                tasks: tasks,
                payload: payload,
                saturated: null,
                empty: null,
                drain: null,
                push: function(data, callback) {
                    data.constructor !== Array && (data = [data]), _each(data, function(task) {
                        tasks.push({
                            data: task,
                            callback: "function" == typeof callback ? callback : null
                        }), cargo.saturated && tasks.length === payload && cargo.saturated()
                    }), async.setImmediate(cargo.process)
                },
                process: function process() {
                    if (!working) {
                        if (0 === tasks.length) return void(cargo.drain && cargo.drain());
                        var ts = "number" == typeof payload ? tasks.splice(0, payload) : tasks.splice(0),
                            ds = _map(ts, function(task) {
                                return task.data
                            });
                        cargo.empty && cargo.empty(), working = !0, worker(ds, function() {
                            working = !1;
                            var args = arguments;
                            _each(ts, function(data) {
                                data.callback && data.callback.apply(null, args)
                            }), process()
                        })
                    }
                },
                length: function() {
                    return tasks.length
                },
                running: function() {
                    return working
                }
            };
        return cargo
    };
    var _console_fn = function(name) {
        return function(fn) {
            var args = Array.prototype.slice.call(arguments, 1);
            fn.apply(null, args.concat([function(err) {
                var args = Array.prototype.slice.call(arguments, 1);
                "undefined" != typeof console && (err ? console.error && console.error(err) : console[name] && _each(args, function(x) {
                    console[name](x)
                }))
            }]))
        }
    };
    async.log = _console_fn("log"), async.dir = _console_fn("dir"), async.memoize = function(fn, hasher) {
        var memo = {},
            queues = {};
        hasher = hasher || function(x) {
            return x
        };
        var memoized = function() {
            var args = Array.prototype.slice.call(arguments),
                callback = args.pop(),
                key = hasher.apply(null, args);
            key in memo ? callback.apply(null, memo[key]) : key in queues ? queues[key].push(callback) : (queues[key] = [callback], fn.apply(null, args.concat([function() {
                memo[key] = arguments;
                var q = queues[key];
                delete queues[key];
                for (var i = 0, l = q.length; l > i; i++) q[i].apply(null, arguments)
            }])))
        };
        return memoized.memo = memo, memoized.unmemoized = fn, memoized
    }, async.unmemoize = function(fn) {
        return function() {
            return (fn.unmemoized || fn).apply(null, arguments)
        }
    }, async.times = function(count, iterator, callback) {
        for (var counter = [], i = 0; count > i; i++) counter.push(i);
        return async.map(counter, iterator, callback)
    }, async.timesSeries = function(count, iterator, callback) {
        for (var counter = [], i = 0; count > i; i++) counter.push(i);
        return async.mapSeries(counter, iterator, callback)
    }, async.compose = function() {
        var fns = Array.prototype.reverse.call(arguments);
        return function() {
            var that = this,
                args = Array.prototype.slice.call(arguments),
                callback = args.pop();
            async.reduce(fns, args, function(newargs, fn, cb) {
                fn.apply(that, newargs.concat([function() {
                    var err = arguments[0],
                        nextargs = Array.prototype.slice.call(arguments, 1);
                    cb(err, nextargs)
                }]))
            }, function(err, results) {
                callback.apply(that, [err].concat(results))
            })
        }
    };
    var _applyEach = function(eachfn, fns) {
        var go = function() {
            var that = this,
                args = Array.prototype.slice.call(arguments),
                callback = args.pop();
            return eachfn(fns, function(fn, cb) {
                fn.apply(that, args.concat([cb]))
            }, callback)
        };
        if (arguments.length > 2) {
            var args = Array.prototype.slice.call(arguments, 2);
            return go.apply(this, args)
        }
        return go
    };
    async.applyEach = doParallel(_applyEach), async.applyEachSeries = doSeries(_applyEach), async.forever = function(fn, callback) {
        function next(err) {
            if (err) {
                if (callback) return callback(err);
                throw err
            }
            fn(next)
        }
        next()
    }, "undefined" != typeof define && define.amd ? define([], function() {
        return async
    }) : "undefined" != typeof module && module.exports ? module.exports = async : root.async = async
}(),
function($) {
    function maybeCall(thing, ctx) {
        return "function" == typeof thing ? thing.call(ctx) : thing
    }

    function isElementInDOM(ele) {
        for (; ele = ele.parentNode;)
            if (ele == document) return !0;
        return !1
    }

    function Tipsy(element, options) {
        this.$element = $(element), this.options = options, this.enabled = !0, this.fixTitle()
    }
    Tipsy.prototype = {
        show: function() {
            var title = this.getTitle();
            if (title && this.enabled) {
                var $tip = this.tip();
                $tip.find(".tipsy-inner")[this.options.html ? "html" : "text"](title), $tip[0].className = "tipsy", $tip.remove().css({
                    top: 0,
                    left: 0,
                    visibility: "hidden",
                    display: "block"
                }).prependTo(document.body);
                var tp, pos = $.extend({}, this.$element.offset(), {
                        width: this.$element[0].offsetWidth,
                        height: this.$element[0].offsetHeight
                    }),
                    actualWidth = $tip[0].offsetWidth,
                    actualHeight = $tip[0].offsetHeight,
                    gravity = maybeCall(this.options.gravity, this.$element[0]);
                switch (gravity.charAt(0)) {
                    case "n":
                        tp = {
                            top: pos.top + pos.height + this.options.offset,
                            left: pos.left + pos.width / 2 - actualWidth / 2
                        };
                        break;
                    case "s":
                        tp = {
                            top: pos.top - actualHeight - this.options.offset,
                            left: pos.left + pos.width / 2 - actualWidth / 2
                        };
                        break;
                    case "e":
                        tp = {
                            top: pos.top + pos.height / 2 - actualHeight / 2 + 10,
                          //  left: pos.left + pos.width + this.options.offset
							  left: pos.left-actualWidth-this.options.offset
                        };
                        break;
                    case "w":
                        tp = {
                            top: pos.top + pos.height / 2 - actualHeight / 2,
                            left: pos.left + pos.width + this.options.offset
                        }
                }
                2 == gravity.length && ("w" == gravity.charAt(1) ? tp.left = pos.left + pos.width / 2 - 15 : tp.left = pos.left + pos.width / 2 - actualWidth + 15), $tip.css(tp).addClass("tipsy-" + gravity), $tip.find(".tipsy-arrow")[0].className = "tipsy-arrow tipsy-arrow-" + gravity.charAt(0), this.options.className && $tip.addClass(maybeCall(this.options.className, this.$element[0])), this.options.fade ? $tip.stop().css({
                    opacity: 0,
                    display: "block",
                    visibility: "visible"
                }).animate({
                    opacity: this.options.opacity
                }) : $tip.css({
                    visibility: "visible",
                    opacity: this.options.opacity
                })
            }
        },
        hide: function() {
            this.options.fade ? this.tip().stop().fadeOut(function() {
                $(this).remove()
            }) : this.tip().remove()
        },
        fixTitle: function() {
            var $e = this.$element;
            ($e.attr("title") || "string" != typeof $e.attr("original-title")) && $e.attr("original-title", $e.attr("title") || "").removeAttr("title")
        },
        getTitle: function() {
            var title, $e = this.$element,
                o = this.options;
            this.fixTitle();
            var title, o = this.options;
            return "string" == typeof o.title ? title = $e.attr("title" == o.title ? "original-title" : o.title) : "function" == typeof o.title && (title = o.title.call($e[0])), title = ("" + title).replace(/(^\s*|\s*$)/, ""), title || o.fallback
        },
        tip: function() {
            return this.$tip || (this.$tip = $('<div class="tipsy"></div>').html('<div class="tipsy-arrow"></div><div class="tipsy-inner"></div>'), this.$tip.data("tipsy-pointee", this.$element[0])), this.$tip
        },
        validate: function() {
            this.$element[0].parentNode || (this.hide(), this.$element = null, this.options = null)
        },
        enable: function() {
            this.enabled = !0
        },
        disable: function() {
            this.enabled = !1
        },
        toggleEnabled: function() {
            this.enabled = !this.enabled
        }
    }, $.fn.tipsy = function(options) {
        function get(ele) {
            var tipsy = $.data(ele, "tipsy");
            return tipsy || (tipsy = new Tipsy(ele, $.fn.tipsy.elementOptions(ele, options)), $.data(ele, "tipsy", tipsy)), tipsy
        }

        function enter() {
            var tipsy = get(this);
            tipsy.hoverState = "in", 0 == options.delayIn ? tipsy.show() : (tipsy.fixTitle(), setTimeout(function() {
                "in" == tipsy.hoverState && tipsy.show()
            }, options.delayIn))
        }

        function leave() {
            var tipsy = get(this);
            tipsy.hoverState = "out", 0 == options.delayOut ? tipsy.hide() : setTimeout(function() {
                "out" == tipsy.hoverState && tipsy.hide()
            }, options.delayOut)
        }
        if (options === !0) return this.data("tipsy");
        if ("string" == typeof options) {
            var tipsy = this.data("tipsy");
            return tipsy && tipsy[options](), this
        }
        if (options = $.extend({}, $.fn.tipsy.defaults, options), options.live || this.each(function() {
                get(this)
            }), "manual" != options.trigger) {
            var binder = options.live ? "live" : "bind",
                eventIn = "hover" == options.trigger ? "mouseenter" : "focus",
                eventOut = "hover" == options.trigger ? "mouseleave" : "blur";
            this[binder](eventIn, enter)[binder](eventOut, leave)
        }
        return this
    }, $.fn.tipsy.defaults = {
        className: null,
        delayIn: 0,
        delayOut: 0,
        fade: !1,
        fallback: "",
        gravity: "n",
        html: !1,
        live: !1,
        offset: 0,
        opacity: .8,
        title: "title",
        trigger: "hover"
    }, $.fn.tipsy.revalidate = function() {
        $(".tipsy").each(function() {
            var pointee = $.data(this, "tipsy-pointee");
            pointee && isElementInDOM(pointee) || $(this).remove()
        })
    }, $.fn.tipsy.elementOptions = function(ele, options) {
        return $.metadata ? $.extend({}, options, $(ele).metadata()) : options
    }, $.fn.tipsy.autoNS = function() {
        return $(this).offset().top > $(document).scrollTop() + $(window).height() / 2 ? "s" : "n"
    }, $.fn.tipsy.autoWE = function() {
        return $(this).offset().left > $(document).scrollLeft() + $(window).width() / 2 ? "e" : "w"
    }, $.fn.tipsy.autoBounds = function(margin, prefer) {
        return function() {
            var dir = {
                    ns: prefer[0],
                    ew: prefer.length > 1 ? prefer[1] : !1
                },
                boundTop = $(document).scrollTop() + margin,
                boundLeft = $(document).scrollLeft() + margin,
                $this = $(this);
            return $this.offset().top < boundTop && (dir.ns = "n"), $this.offset().left < boundLeft && (dir.ew = "w"), $(window).width() + $(document).scrollLeft() - $this.offset().left < margin && (dir.ew = "e"), $(window).height() + $(document).scrollTop() - $this.offset().top < margin && (dir.ns = "s"), dir.ns + (dir.ew ? dir.ew : "")
        }
    }
}(jQuery),
function($) {
    var current = null;
    $.kmodal = function(el, options) {
        $.kmodal.close();
        var remove, target;
        if (this.$body = $("body"), this.options = $.extend({}, $.kmodal.defaults, options), this.options.doFade = !isNaN(parseInt(this.options.fadeDuration, 10)), el.is("a"))
            if (target = el.attr("href"), /^#/.test(target)) {
                if (this.$elm = $(target), 1 !== this.$elm.length) return null;
                this.open()
            } else this.$elm = $("<div>"), this.$body.append(this.$elm), remove = function(event, modal) {
                modal.elm.remove()
            }, this.showSpinner(), el.trigger($.kmodal.AJAX_SEND), $.get(target).done(function(html) {
                current && (el.trigger($.kmodal.AJAX_SUCCESS), current.$elm.empty().append(html).on($.kmodal.CLOSE, remove), current.hideSpinner(), current.open(), el.trigger($.kmodal.AJAX_COMPLETE))
            }).fail(function() {
                el.trigger($.kmodal.AJAX_FAIL), current.hideSpinner(), el.trigger($.kmodal.AJAX_COMPLETE)
            });
        else this.$elm = el, this.$body.append(this.$elm), this.open()
    }, $.kmodal.prototype = {
        constructor: $.kmodal,
        open: function() {
            var m = this;
            this.options.doFade ? (this.block(), setTimeout(function() {
                m.show()
            }, this.options.fadeDuration * this.options.fadeDelay)) : (this.block(), this.show()), this.options.escapeClose && $(document).on("keydown.modal", function(event) {
                27 == event.which && $.kmodal.close()
            }), this.options.clickClose && this.blocker.click($.kmodal.close)
        },
        close: function() {
            this.unblock(), this.hide(), $(document).off("keydown.modal")
        },
        block: function() {
            var initialOpacity = this.options.doFade ? 0 : this.options.opacity;
            this.$elm.trigger($.kmodal.BEFORE_BLOCK, [this._ctx()]), this.blocker = $('<div class="jquery-modal blocker"></div>').css({
                top: 0,
                right: 0,
                bottom: 0,
                left: 0,
                width: "100%",
                height: "100%",
                position: "fixed",
                zIndex: this.options.zIndex,
                background: this.options.overlay,
                opacity: initialOpacity
            }), this.$body.append(this.blocker), this.options.doFade && this.blocker.animate({
                opacity: this.options.opacity
            }, this.options.fadeDuration), this.$elm.trigger($.kmodal.BLOCK, [this._ctx()])
        },
        unblock: function() {
            this.options.doFade ? this.blocker.fadeOut(this.options.fadeDuration, function() {
                $(this).remove()
            }) : this.blocker.remove()
        },
        show: function() {
            this.$elm.trigger($.kmodal.BEFORE_OPEN, [this._ctx()]), this.options.showClose && (this.closeButton = $('<a href="#close-modal" rel="modal:close" class="close-modal ' + this.options.closeClass + '">' + this.options.closeText + "</a>"), this.$elm.append(this.closeButton)), this.$elm.addClass(this.options.modalClass + " current"), this.center(), this.options.doFade ? this.$elm.fadeIn(this.options.fadeDuration) : this.$elm.show(), this.$elm.trigger($.kmodal.OPEN, [this._ctx()])
        },
        hide: function() {
            this.$elm.trigger($.kmodal.BEFORE_CLOSE, [this._ctx()]), this.closeButton && this.closeButton.remove(), this.$elm.removeClass("current"), this.options.doFade ? this.$elm.fadeOut(this.options.fadeDuration) : this.$elm.hide(), this.$elm.trigger($.kmodal.CLOSE, [this._ctx()])
        },
        showSpinner: function() {
            this.options.showSpinner && (this.spinner = this.spinner || $('<div class="' + this.options.modalClass + '-spinner"></div>').append(this.options.spinnerHtml), this.$body.append(this.spinner), this.spinner.show())
        },
        hideSpinner: function() {
            this.spinner && this.spinner.remove()
        },
        center: function() {
            this.$elm.css({
                position: "fixed",
                top: "50%",
                left: "50%",
                marginTop: -(this.$elm.outerHeight() / 2),
                marginLeft: -(this.$elm.outerWidth() / 2),
                zIndex: this.options.zIndex + 1
            })
        },
        _ctx: function() {
            return {
                elm: this.$elm,
                blocker: this.blocker,
                options: this.options
            }
        }
    }, $.kmodal.prototype.resize = $.kmodal.prototype.center, $.kmodal.close = function(event) {
        if (current) {
            event && event.preventDefault(), current.close();
            var that = current.$elm;
            return current = null, that
        }
    }, $.kmodal.resize = function() {
        current && current.resize()
    }, $.kmodal.isActive = function() {
        return current ? !0 : !1
    }, $.kmodal.defaults = {
        overlay: "#000",
        opacity: .75,
        zIndex: 1,
        escapeClose: !0,
        clickClose: !0,
        closeText: "Close",
        closeClass: "",
        modalClass: "regenerate-modal",
        spinnerHtml: null,
        showSpinner: !0,
        showClose: !0,
        fadeDuration: null,
        fadeDelay: 1
    }, $.kmodal.BEFORE_BLOCK = "modal:before-block", $.kmodal.BLOCK = "modal:block", $.kmodal.BEFORE_OPEN = "modal:before-open", $.kmodal.OPEN = "modal:open", $.kmodal.BEFORE_CLOSE = "modal:before-close", $.kmodal.CLOSE = "modal:close", $.kmodal.AJAX_SEND = "modal:ajax:send", $.kmodal.AJAX_SUCCESS = "modal:ajax:success", $.kmodal.AJAX_FAIL = "modal:ajax:fail", $.kmodal.AJAX_COMPLETE = "modal:ajax:complete", $.fn.kmodal = function(options) {
        return 1 === this.length && (current = new $.kmodal(this, options)), this
    }, $(document).on("click.modal", 'a[rel="modal:close"]', $.kmodal.close), $(document).on("click.modal", 'a[rel="modal:open"]', function(event) {
        event.preventDefault(), $(this).kmodal()
    })
}
(jQuery), jQuery(document).ready(function($) {
    var tipsySettings = {
        gravity: "e",
        html: !0,
        trigger: "manual",
        className: function() {
            return "tipsy-" + $(this).data("id")
        },
        title: function() {
            return activeId = $(this).data("id"), $(this).attr("original-title")
        }
    };
    $(".regenerateWhatsThis").tipsy({
        fade: !0,
        gravity: "w"
    }), $(".regenerateError").tipsy({
        fade: !0,
        gravity: "w"
    });
    var data = {
            action: "regenerate_requestd"
        },
        errorTpl = '<div class="regenerateErrorWrap"><a class="regenerateError">' + wp_way2_regen_msgs.failed_h + '</a></div>',
        $btnApplyBulkActiond = $("#doactiond"),
        $btnApplyBulkAction2d = $("#doaction2d"),
        $topBulkActionDropdown = $(".tablenav.top .bulkactions select[name='action']"),
        $bottomBulkActionDropdown = $(".tablenav.bottom .bulkactions select[name='action2']"),
        requestSuccess = function(data, textStatus, jqXHR) {
            var $button = $(this),
                $parent = $(this).closest(".regenerate-wrap, .buttonWrap"),
                $cell = $(this).closest("td");
            if (data.html) {
                $button.text(wp_way2_regen_msgs.img_opz);
                var originalSize = (data.type, data.original_size),
                    $originalSizeColumn = $(this).parent().prev("td.original_size");
                $parent.fadeOut("fast", function() {
                    $cell.find(".noSavings, .regenerateErrorWrap").remove(), $cell.html(data.html), $cell.find(".regenerate-item-details").tipsy(tipsySettings), $originalSizeColumn.html(originalSize), $parent.remove()
                })
            } else if (data.error) {
                var $error = $(errorTpl).attr("title", data.error);
                $parent.closest("td").find(".regenerateErrorWrap").remove(), $parent.after($error), $error.tipsy({
                    fade: !0,
                    gravity: "e"
                }), $button.text(wp_way2_regen_msgs.ret_req).removeAttr("disabled").css({
                    opacity: 1
                })
            }
        },
        requestFail = function(jqXHR, textStatus, errorThrown) {
            $(this).removeAttr("disabled")
        },
        requestComplete = function(jqXHR, textStatus, errorThrown) {
            $(this).removeAttr("disabled"), $(this).parent().find(".regenerateSpinner").css("display", "none")
        },
opts = '<option value="regenerate-bulk-lossy">Compress Directory</option>';
$topBulkActionDropdown.find("option:last-child").before(opts), $bottomBulkActionDropdown.find("option:last-child").before(opts);
var getBulkImageDatad = function() {
            var $rows = $("tr[id^='postd-']"),
                $row = null,
                postId = 0,
                $enjoyedBtn = null,
                btnData = {},
                originalSize = "",
                rv = [];
            return $rows.each(function() {
                $row = $(this), postId = this.id.replace(/^\D+/g, ""), $row.find("input[type='checkbox'][value='" + postId + "']:checked").length && ($enjoyedBtn = $row.find(".regenerate_req"), $enjoyedBtn.length && (btnData = $enjoyedBtn.data(), originalSize = $.trim($row.find("td.original_size").text()), btnData.originalSize = originalSize, rv.push(btnData)))
            }), rv
        },
        bulkModalOptions = {
            zIndex: 4,
            escapeClose: !0,
            clickClose: !1,
            closeText: "close",
            showClose: !1
        },
        renderBulkImageSummary = function(bulkImageDatad) {
            var settingd = regenerate_settings.api_lossy,
                nImagesd = bulkImageDatad.length,
                headerd = '<p class="regenerateBulkHeader">' + wp_way2_regen_msgs.bulkc + ' <span class="close-regenerate-bulk">&times;</span></p>',
                enjoyedEmAlld= '<button class="regenerate_req_bulk">' + wp_way2_regen_msgs.comp_all + '</button>',
                typeRadiosd = '<div class="radiosWrap"><p>' + wp_way2_regen_msgs.opti_mode + ':</p><label><input type="radio" id="regenerate-bulk-type-lossy" value="lossy" name="regenerate-bulk-type"/>' + wp_way2_regen_msgs.way2_lossy + '</label>&nbsp;&nbsp;&nbsp;<label><input type="radio" id="regenerate-bulk-type-lossless" value="lossless" name="regenerate-bulk-type"/>' + wp_way2_regen_msgs.loss_less + '</label></div>',
                $modal = $('<div id="regenerate-bulk-modal" class="regenerate-modal"></div>').html(headerd).append(typeRadiosd).append('<p class="the-following"><strong>' + nImagesd + '</strong> ' + wp_way2_regen_msgs.opti_mess + ' <a id="rateus" class="button button-primary button-hero" title="' + wp_way2_regen_msgs.rt_us + '" href="https://wordpress.org/support/view/plugin-reviews/regenerate-thumbnails-in-cloud?rate=5#postform" target="_blank">' + wp_way2_regen_msgs.rt_us + '</a><!--using the <strong class="bulkSetting">' + settingd + "</strong> setting:--></p>").appendTo("body").kmodal(bulkModalOptions).bind($.kmodal.BEFORE_CLOSE, function(event, modal) {}).bind($.kmodal.OPEN, function(event, modal) {}).bind($.kmodal.CLOSE, function(event, modal) {
                    $("#regenerate-bulk-modal").remove()
                }).css({
                    top: "10px",
                    marginTop: "40px"
                });
            if (settingd === undefined) {
                var setting1 = 'lossy';
            } else {
                var setting1 = settingd;
            }
            "lossy" === setting1 ? $("#regenerate-bulk-type-lossy").attr("checked", !0) : $("#regenerate-bulk-type-lossless").attr("checked", !0), $bulkSettingSpan = $(".bulkSetting"), $("input[name='regenerate-bulk-type']").change(function() {
                var text = "regenerate-bulk-type-lossy" === this.id ? "lossy" : "lossless";
                $bulkSettingSpan.text(text)
            }), $(".jquery-modal.blocker").click(function(e) {
                return !1
            }), $("#menu-media ul.wp-submenu").css({
                "z-index": 1
            });
            var $tabled = $('<table id="regenerate-bulkd"></table>'),
                $headerRowd = $('<tr class="regenerate-bulk-header"><td>' + wp_way2_regen_msgs.nameuu + '</td><td style="width:120px">' + wp_way2_regen_msgs.original_sz + '</td><td style="width:120px">' + wp_way2_regen_msgs.regenerate_st + '</td></tr>');
            $tabled.append($headerRowd), $.each(bulkImageDatad, function(index, element) {
                $tabled.append('<tr class="regenerate-item-row" data-regeneratebulkid="' + element.id + '"><td class="regenerate-bulk-filename">' + element.filename + '</td><td class="regenerate-originalsize">' + element.originalSize + '</td><td class="regenerate-regenerateedsize"><span class="regenerateBulkSpinner hidden"></span></td></tr>')
            }), $modal.append($tabled).append(enjoyedEmAlld), $(".close-regenerate-bulk").click(function() {
                $.kmodal.close()
            }), nImagesd || $(".regenerate_req_bulk").attr("disabled", !0).css({
                opacity: .5
            })
        },
        bulkActiond = function(bulkImageDatad) {
            $bulkTabled = $("#regenerate-bulkd");
            var parallelprocessd = regenerate_settings.bulk_async_limit;
            if (parallelprocessd === undefined) {
                var parallelp = '1';
            } else {
                var parallelp = parallelprocessd;
            }
            var jqxhr = null,
                q = async.queue(function(task, callback) {
                    var id = task.id,
                        $row = (task.filename, $bulkTabled.find("tr[data-regeneratebulkid='" + id + "']")),
                        $regenerateedSizeColumn = $row.find(".regenerate-regenerateedsize"),
                        $spinner = $regenerateedSizeColumn.find(".regenerateBulkSpinner").css({
                            display: "inline-block"
                        }),
                        $savingsPercentColumn = $row.find(".regenerate-savingsPercent"),
                        $savingsBytesColumn = $row.find(".regenerate-savings");
                    jqxhr = $.ajax({
                        url: ajax_object.ajax_url,
                        data: {
                            action: "regenerate_requestd",
                            id: id,
                            type: $("input[name='regenerate-bulk-type']:checked").val(),
                            origin: "bulk_optimizer"
                        },
                        type: "post",
                        dataType: "json",
                        timeout: 3600e4
                    }).done(function(data, textStatus, jqXHR) {
                        if (data.success && "undefined" == typeof data.message) {
                            var originalSize = (data.type, data.original_size),
                                savingsPercent = (data.html, data.savings_percent),
                                savingsBytes = data.saved_bytes;
                            $regenerateedSizeColumn.html(data.html), $regenerateedSizeColumn.find(".regenerate-item-details").remove(), $savingsPercentColumn.text(savingsPercent), $savingsBytesColumn.text(savingsBytes);
                            var $button = $("button[id='regenerateid-" + id + "']"),
                                $parent = $button.parent(),
                                $cell = $button.closest("td"),
                                $originalSizeColumn = $button.parent().prev("td.original_size");
                            $parent.fadeOut("fast", function() {
                                $cell.find(".noSavings, .regenerateErrorWrap").remove(), $cell.empty().html(data.html), $cell.find(".regenerate-item-details").tipsy(tipsySettings), $originalSizeColumn.html(originalSize), $parent.remove()
                            })
                        } else data.error && wp_way2_regen_msgs.any_fur === data.error && $regenerateedSizeColumn.text(wp_way2_regen_msgs.no_svng)
                    }).fail(function() {}).always(function() {
                        $spinner.css({
                            display: "none"
                        }), callback()
                    })
                }, parallelp);
            q.drain = function() {
                $(".regenerate_req_bulk").removeAttr("disabled").css({
                    opacity: 1
                }).text(wp_way2_regen_msgs.doneuu).unbind("click").click(function() {
                    $.kmodal.close()
                })
            }, q.push(bulkImageDatad, function(err) {})
        };
    $btnApplyBulkActiond.add($btnApplyBulkAction2d).click(function(e) {
        if ("regenerate-bulk-lossy" === $(this).prev("select").val()) {
            e.preventDefault();
            var bulkImageDatad = getBulkImageDatad();
            renderBulkImageSummary(bulkImageDatad), $(".regenerate_req_bulk").click(function(e) {
                e.preventDefault(), $(this).attr("disabled", !0).css({
                    opacity: .5
                }), bulkActiond(bulkImageDatad)
            }), $('.regenerate_req_bulk').trigger('click')
        }
    });
	
	
	
	
	
	
	
	
	
	// directory compress starts here
	
	
	
	

	
	
	
	
	
	
	
	
	
	
	
	
	
	
		// directory compress ends here

	
	
    var activeId = null;
    $(".regenerate-item-details").tipsy(tipsySettings);
    $("body").on("click", ".regenerate-item-details", function(e) {
        var id = $(this).data("id");
        return $(".tipsy").remove(), id == activeId ? (activeId = null, void $(this).text(wp_way2_regen_msgs.shw_dtls)) : ($(".regenerate-item-details").text(wp_way2_regen_msgs.shw_dtls), $(this).tipsy("show"), void $(this).text(wp_way2_regen_msgs.hide_dtls))
    }), $("body").on("click", function(e) {
        var $t = $(e.target);
        $t.hasClass("tipsy") || $t.closest(".tipsy").length || $t.hasClass("regenerate-item-details") || (activeId = null, $(".regenerate-item-details").text("Show details"), $(".tipsy").remove())
    }), $("body").on("click", "small.regenerateReset", function(e) {
        e.preventDefault();
        var $resetButton = $(this),
            resetData = {
                action: "regenerate_reset"
            };
        resetData.id = $(this).data("id"), $row = $("#post-" + resetData.id).find(".compressed_size");
        var $spinner = $('<span class="resetSpinner"></span>');
        $resetButton.after($spinner);
        $.ajax({
            url: ajax_object.ajax_url,
            data: resetData,
            type: "post",
            dataType: "json",
            timeout: 3600e4
        }).done(function(data, textStatus, jqXHR) {
            "undefined" !== data.success && ($row.hide().html(data.html).fadeIn().prev(".original_size.column-original_size").html(data.original_size), $(".tipsy").remove())
        })
    }), $("body").on("click", ".regenerate-reset-all", function(e) {
        e.preventDefault();
        var reset = confirm(wp_way2_regen_msgs.all_meta_reset_way2);
        if (reset) {
            var $resetButton = $(this);
            $resetButton.text(wp_way2_regen_msgs.reset_way2_wait).attr("disabled", !0);
            var resetData = {
                    action: "regenerate_reset_all"
                },
                $spinner = $('<span class="resetSpinner"></span>');
            $resetButton.after($spinner); {
                $.ajax({
                    url: ajax_object.ajax_url,
                    data: resetData,
                    type: "post",
                    dataType: "json",
                    timeout: 3600e4
                }).done(function(data, textStatus, jqXHR) {
                    $spinner.remove(), $resetButton.text("Your images have been reset.").removeAttr("disabled").removeClass("enabled")
                })
            }
        }
    }), $("body").on("click", ".regenerate_req", function(e) {
        e.preventDefault();
        var $button = $(this),
            $parent = $(this).parent();
        data.id = $(this).data("id"), $button.text(wp_way2_regen_msgs.optimizing_img).attr("disabled", !0).css({
            opacity: .5
        }), $parent.find(".regenerateSpinner").css("display", "inline");
        $.ajax({
            url: ajax_object.ajax_url,
            data: data,
            type: "post",
            dataType: "json",
            timeout: 3600e4,
            context: $button
        }).done(requestSuccess).fail(requestFail).always(requestComplete)
    })
});