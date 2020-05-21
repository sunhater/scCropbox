(function($) {

    $.fn.shCropbox = function(options) {

        var action, index = 0,

            defaultOptions = {
                min: 50,
                scrollPreventTouch: 'body',
                update: function(x, y, width, height, xMax, yMax) {
                    console.log('x=' + x, 'y=' + y, 'w=' + width, 'h=' + height, 'xMax=' + xMax, 'yMax=' + yMax);
                }
            };

        if (typeof options === 'string') {
            action = options;
            options = undefined;
        }

        $(this).each(function() {

            var $root, id,
                o = $.extend(true, {}, defaultOptions, $(this).data(), options);

            if ($(this).parents('.cropbox').length) {
                $root = $(this).parents('.cropbox');
                id = $root.prop('id');
                $(this).detach();
                $root.after($(this)).remove();
                $(window).off('resize.' + id);
            }

            if ((action === 'dispose') || (action === 'destroy'))
                return;

            var $drag, x, y, ox, oy, w, h, l, t, wi, he, px, py,
                $img = $(this),

                $crop = $('<div class="sh-cropbox-crop" draggable="true" />').append('<div />').append('<div />').append('<div />').append('<div />'),
                $wrap = $('<div class="sh-cropbox-wrap" />').append($crop),

                $nn = $('<div class="sh-cropbox-handle n" draggable="true" />'),
                $ww = $('<div class="sh-cropbox-handle w" draggable="true" />'),
                $ee = $('<div class="sh-cropbox-handle e" draggable="true" />'),
                $ss = $('<div class="sh-cropbox-handle s" draggable="true" />'),
                $ne = $('<div class="sh-cropbox-handle ne" draggable="true" />'),
                $nw = $('<div class="sh-cropbox-handle nw" draggable="true" />'),
                $se = $('<div class="sh-cropbox-handle se" draggable="true" />'),
                $sw = $('<div class="sh-cropbox-handle sw" draggable="true" />'),
                $handles = $('<div class="sh-cropbox-handles" />').append($nn, $ww, $ee, $ss, $ne, $nw, $se, $sw),

                render = function(x, y, w, h, exclude) {

                    $crop.css({left: x, top: y, width: w, height: h});

                    var calc = function(px) { return 'calc(' + px + 'px - .5rem)'; },
                        x1 = calc(x), x2 = calc(x + (w / 2)), x3 = calc(x + w),
                        y1 = calc(y), y2 = calc(y + (h / 2)), y3 = calc(y + h);

                    (exclude === $nw.get(0) ? $drag : $nw).css({left: x1, top: y1});
                    (exclude === $ne.get(0) ? $drag : $ne).css({left: x3, top: y1});
                    (exclude === $sw.get(0) ? $drag : $sw).css({left: x1, top: y3});
                    (exclude === $se.get(0) ? $drag : $se).css({left: x3, top: y3});
                    (exclude === $nn.get(0) ? $drag : $nn).css({left: x2, top: y1});
                    (exclude === $ww.get(0) ? $drag : $ww).css({left: x1, top: y2});
                    (exclude === $ss.get(0) ? $drag : $ss).css({left: x2, top: y3});
                    (exclude === $ee.get(0) ? $drag : $ee).css({left: x3, top: y2});
                },

                fffix = function(on) {
                    $('body').off('dragover.shCropbox');

                    if (on)
                        $('body').on('dragover.shCropbox', function(e) {
                            try {
                                e = e || window.event;
                                $('body').data({
                                    pageX: e.pageX,
                                    pageY: e.pageY
                                });
                            } catch (ex) {}
                        });
                },

                removeGhost = function(el) {
                    $(el)
                        .on('dragstart', function(e) {
                            var ghost = $('<div />').html('&nbsp;').css({
                                opacity: 0,
                                position: 'fixed',
                                left: '-5000rem',
                                top: '-5000rem'
                            }).appendTo('body').get(0);
                            $(this).data({ghost: ghost});
                            e.originalEvent.dataTransfer.setDragImage(ghost, 0, 0);
                        })

                        .on('dragend', function() {
                            var ghost = $(this).data('ghost');
                            if (ghost !== undefined) {
                                $(ghost).remove();
                                $(this).removeData('ghost');
                            }
                        });
                },

                init = function() {
                    $handles.css({width: $wrap.width()});

                    var r = Math.round,
                        p = $crop.position(),
                        x = p.left,
                        y = p.top,
                        w = $crop.width(),
                        h = $crop.height();

                    render(x, y, w, h);
                    o.update(r(x), r(y), r(w), r(h), r($img.width()), r($img.height()));
                };

            while ($('#sh-cropbox' + ++index).length);
            id = 'sh-cropbox' + index;
            $root = $('<div class="cropbox" />').append($handles, $wrap).attr({id: id});
            $img.after($root).detach();
            $wrap.prepend($img);

            if ($img.is('img') && !$img.height()) {
                var i = 0, int = setInterval(function() {
                    if ((i++ > 300) || $img.height()) {
                        clearInterval(int);
                        init();
                    }
                }, 100);
            } else
                init();

            $handles.find('.sh-cropbox-handle')

                .on('contextmenu', function() { return false; })

                .on('dragstart touchstart', function(e) {

                    if (e.touches !== undefined)
                        e = e.touches[0];

                    fffix(true);

                    var that = this,
                        p = $crop.position();

                    x = p.left;
                    y = p.top;

                    w = $crop.width();
                    h = $crop.height();

                    ox = (e.offsetX === undefined) ? ($(this).width() / 2) : e.offsetX;
                    oy = (e.offsetY === undefined) ? ($(this).height() / 2) : e.offsetY;

                    $(this).addClass('drag');

                    $drag = $('<div class="sh-cropbox-handle" draggable="true" />').on('contextmenu', function() { return false; }).css({left: '-5000rem', top: '-5000rem'});

                    if (e instanceof Touch) {
                        p = $(that).position();
                        $drag.css({
                            left: p.left,
                            top: p.top
                        });
                    }

                    $handles.append($drag);
                    $crop.removeData('prev');

                    if (e instanceof Touch)
                        $(o.scrollPreventTouch).addClass('sh-cropbox-overhidden');
                })

                .on('dragend touchend touchcancel', function(e) {
                    fffix(false);

                    x = l;
                    y = t;
                    w = wi;
                    h = he;

                    $(this).removeClass('drag').css({
                        left: $drag.css('left'),
                        top: $drag.css('top')
                    });

                    $drag.remove();
                    var r = Math.round;
                    o.update(r(x), r(y), r(w), r(h), r($img.width()), r($img.height()));

                    if (e instanceof Touch)
                        $(o.scrollPreventTouch).removeClass('sh-cropbox-overhidden');
                })

                .on('drag touchmove', function(e) {

                    if (e.touches !== undefined)
                        e = e.touches[0];

                    var that = this,
                        xMax = $img.width(),
                        yMax = $img.height();

                    setTimeout(function() {

                        // FIREFOX FIX
                        if ((e.pageX === 0) && (e.pageY === 0)) {
                            var bd = $('body').data(),
                                pp = $(that).offset();
                            e.pageX = bd.pageX;
                            e.pageY = bd.pageY;
                            e.offsetX = bd.pageX - pp.left;
                            e.offsetY = bd.pageY - pp.top;
                        }

                        if (e.offsetX === undefined) {
                            var pp = $(that).offset();
                            e.offsetX = e.pageX - pp.left;
                            e.offsetY = e.pageY - pp.top;
                        }

                        if (that === $nw.get(0)) {
                            l = (x - ox + e.offsetX);
                            t = (y - oy + e.offsetY);

                            wi = (x + w - l);
                            he = (y + h - t);

                            if (l < 0) {
                                l = 0;
                                wi = x + w;
                            }

                            if (t < 0) {
                                t = 0;
                                he = y + h;
                            }

                            if (wi < o.min) {
                                l = x + w - o.min;
                                wi = o.min;
                            }

                            if (he < o.min) {
                                t = y + h - o.min;
                                he = o.min;
                            }

                            render(l, t, wi, he, that);
                        }

                        else if (that === $se.get(0)) {

                            l = x;
                            t = y;
                            px = e.offsetX - ox + x + w;
                            py = e.offsetY - oy + y + h;

                            if (px > xMax)
                                px = xMax;

                            if (py > yMax)
                                py = yMax;

                            wi = px - x;
                            he = py - y;

                            if (wi < o.min)
                                wi = o.min;

                            if (he < o.min)
                                he = o.min;

                            render(l, t, wi, he, that);
                        }

                        else if (that === $ne.get(0)) {

                            l = x;
                            t = y - oy + e.offsetY;
                            px = x - ox + e.offsetX + w;

                            if (px > xMax)
                                px = xMax;

                            if (t < 0)
                                t = 0;

                            wi = px - x;
                            he = y + h - t;

                            if (wi < o.min)
                                wi = o.min;

                            if (he < o.min) {
                                t = y + h - o.min;
                                he = o.min;
                            }

                            render(l, t, wi, he, that);
                        }

                        else if (that === $sw.get(0)) {

                            l = x - ox + e.offsetX;
                            t = y;
                            py = y - oy + e.offsetY + h;

                            if (l < 0)
                                l = 0;

                            if (py > yMax)
                                py = yMax;

                            wi = x + w - l;
                            he = py - y;

                            if (wi < o.min) {
                                l = x + w - o.min;
                                wi = o.min;
                            }

                            if (he < o.min)
                                he = o.min;

                            render(l, t, wi, he, that);
                        }

                        else if (that === $nn.get(0)) {

                            t = y - oy + e.offsetY;

                            if (t < 0)
                                t = 0;

                            he = h + y - t;

                            if (he < o.min) {
                                he = o.min;
                                t = h + y - o.min;
                            }

                            render(x, t, w, he, that);
                        }

                        else if (that === $ss.get(0)) {

                            t = y;
                            he = h + e.offsetY - oy;

                            if (he < o.min)
                                he = o.min;

                            if (he + y > yMax)
                                he = yMax - y;

                            render(x, t, w, he, that);
                        }

                        else if (that === $ww.get(0)) {

                            l = x - ox + e.offsetX;

                            if (l < 0)
                                l = 0;

                            wi = w + x - l;

                            if (wi < o.min) {
                                wi = o.min;
                                l = w + x - o.min;
                            }

                            render(l, y, wi, h, that);
                        }

                        else if (that === $ee.get(0)) {

                            l = x;
                            wi = w + e.offsetX - ox;

                            if (wi < o.min)
                                wi = o.min;

                            if (wi + x > xMax)
                                wi = xMax - x;

                            render(l, y, wi, h, that);
                        }
                    });
                });

            removeGhost($crop);

            $crop

                .on('contextmenu', function() { return false; })

                .on('dragstart touchstart', function(e) {

                    if (e.touches !== undefined) {
                        e = e.touches[0];
                        $(o.scrollPreventTouch).addClass('sh-cropbox-overhidden');
                    }

                    fffix(true);

                    var p = $crop.position(),
                        of = $crop.offset();

                    x = p.left;
                    y = p.top;
                    wi = $crop.width();
                    he = $crop.height();
                    ox = (e.offsetX === undefined) ? e.pageX - of.left : e.offsetX;
                    oy = (e.offsetY === undefined) ? e.pageY - of.top : e.offsetY;

                    $crop.removeData('prev');
                })

                .on('dragend touchend touchcancel', function(e) {

                    if (e.touches !== undefined)
                        $(o.scrollPreventTouch).removeClass('sh-cropbox-overhidden');

                    fffix(false);
                    var r = Math.round,
                        p = $crop.position();
                    o.update(r(p.left), r(p.top), r($crop.width()), r($crop.height()), r($img.width()), r($img.height()));
                })

                .on('drag touchmove', function(e) {
                    if (e.touches !== undefined)
                        e = e.touches[0];

                    var xMax = $img.width(),
                        yMax = $img.height();

                    setTimeout(function() {

                        if ((e.pageX === 0) && (e.pageY === 0)) {
                            var bd = $('body').data();
                            e.pageX = bd.pageX;
                            e.pageY = bd.pageY;
                        }

                        var wo = $wrap.offset();

                        l = e.pageX - wo.left - ox;
                        t = e.pageY - wo.top - oy;

                        if (l < 0)
                            l = 0;

                        if (t < 0)
                            t = 0;

                        if (l + wi > xMax)
                            l = xMax - wi;

                        if (t + he > yMax)
                            t = yMax - he;

                        render(l, t, wi, he);
                    });
                })

                .dblclick(function() {
                    var r = Math.round,
                        prev = $(this).data('prev'),
                        xMax = $img.width(),
                        yMax = $img.height();

                    if (prev === undefined) {
                        var p = $crop.position();
                        $crop.data({prev: {
                            x: p.left,
                            y: p.top,
                            w: $crop.width(),
                            h: $crop.height()
                        }});
                        x = y = 0; w = xMax; h = yMax;

                    } else {
                        x = prev.x; y = prev.y; w = prev.w; h = prev.h;
                        $crop.removeData('prev');
                    }

                    render(x, y, w, h);
                    o.update(r(x), r(y), r(w), r(h), r(xMax), r(yMax));
                });

            $(window).on('resize.' + id, function() {
                $handles.css({width: $wrap.width()});

                var r = Math.round,
                    p = $crop.position(),
                    xMax = $img.width(),
                    yMax = $img.height(),
                    x = p.left,
                    y = p.top,
                    w = $crop.width(),
                    h = $crop.height();

                if (x + w > xMax) {
                    x = xMax - w;
                    if (x < 0) {
                        x = 0;
                        w = xMax;
                    }
                }

                if (y + h > yMax) {
                    y = yMax - h;
                    if (y < 0) {
                        y = 0;
                        h = yMax;
                    }
                }

                render(x, y, w, h);
                o.update(r(x), r(y), r(w), r(h), r(xMax), r(yMax));
            });
        });

        return $(this);
    }

})(jQuery);