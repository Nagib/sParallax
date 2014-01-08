/* Animation Frame */

window.animationFrame = (function(){
    return  window.requestAnimationFrame   ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame    ||
        window.oRequestAnimationFrame      ||
        window.msRequestAnimationFrame     ||
        function(/* function */ callback, /* DOMElement */ element){
            window.setTimeout(callback, 1000 / 60);
        };
})();

/* SelvaParallax */

(function() {

var Selva = {}; // Wild

Selva.scroll = {};
Selva.scroll.blocked = false;
Selva.scroll.top = 0;
Selva.scroll.tweened = 0;
Selva.scroll.direction = 0;
Selva.scroll.multiplier = .1;
Selva.scroll.modifier = 0;

Selva.scroll.parallax = function() {
    $.each(Selva.scroll.parallax.config, function(i, config) {

        if (!config.status) return;
        if (!Selva.scroll.parallax.between(config)) return;

        $.each(config.modifier, function(property, parallax) {

            if (Selva.scroll.parallax.animations[property]) {
                Selva.scroll.parallax.animations[property](config, parallax);   
            } else {
                Selva.scroll.parallax.animations._default(config, property, parallax);
            }
            
        });
    });
};

Selva.scroll.parallax.init = function(options) {
    if (!options) { return false; }

    Selva.scroll.start = options.start || 0;
    Selva.scroll.end = options.end || -3000;

    Selva.scroll.debug = options.debug || false;

    Selva.scroll.onScroll = options.onScroll || false;
    Selva.scroll.onMove = options.onMove || false;

    $(options.container).mousewheel(Selva.scroll._move);

    _animation();
};

Selva.scroll.parallax.between = function(config) {
    //return (!config.end && config.get_start() >= Selva.scroll.top) || (config.get_start() >= Selva.scroll.tweened && config.get_end() <= Selva.scroll.tweened)
    return config.get_start() >= Selva.scroll.tweened;
};

Selva.scroll.parallax.get_parallax_value = function(config, parallax) {

    var scroll = Selva.scroll.parallax.get_relative_scroll(config);
    var value = (parallax.multiplier)
        ? parallax.get_start() + scroll * parallax.multiplier
        : parallax.get_start();

    if (parallax.multiplier < 0) {
        if (value > parallax.get_end()) value = parallax.get_end();
        else if (value < parallax.get_start()) value = parallax.get_start();
    } else {
        if (value <= parallax.get_end()) value = parallax.get_end();
        else if (value >= parallax.get_start()) value = parallax.get_start();
    }

    return value;
};

Selva.scroll.parallax.get_relative_scroll = function(config) {
    return (Selva.scroll.tweened - config.get_start());
};

Selva.scroll.parallax.animations = {};

Selva.scroll.parallax.animations._default = function(config, property, parallax) {

    var value = Selva.scroll.parallax.get_parallax_value(config, parallax);

    if (Modernizr.csstransitions) {
        if (property == 'top') {
            property = Modernizr.prefixed("transform");
            value = 'translate3d(0px, ' + value + 'px, 0px)';
        }

        config.element.css(property, value);
    };
};

Selva.scroll.parallax.status = function(items, status) {
    $.each(Selva.scroll.parallax.config, function(i, config) {
        $.each(items, function(j, item) {
            if (item == config.element) {
                config.status = status; 
            }
        });
    });

};

Selva.scroll.parallax.desactive = function(items) {
    Selva.scroll.parallax.status(items, 0);
};

Selva.scroll.parallax.active = function(items) {
    Selva.scroll.parallax.status(items, 1);
};

Selva.scroll.parallax.block = function() {
    Selva.scroll.blocked = true;
};

Selva.scroll.parallax.allow = function() {
    Selva.scroll.blocked = false;
};

Selva.scroll.parallax.go_to = function(position, notAnimated) {
    if (Selva.scroll.blocked) return;

    Selva.scroll.multiplier = .05;
    Selva.scroll.top = position;

    if (notAnimated) {
        Selva.scroll.tweened = Selva.scroll.top;
    }

    if (Selva.scroll.onScroll) Selva.scroll.onScroll(Selva.scroll.tweened);    
};

Selva.scroll.parallax.config = {};

Selva.scroll.parallax.save = function(config) {

    if ($.isPlainObject(config)) {

        $.each(config, function(i, c) {
            Selva.scroll.parallax._status(c);
        });

        $.extend(Selva.scroll.parallax.config, config);
    }
};



Selva.scroll.parallax._status = function(config) {
    config.status = (config.status === undefined) ? 1 : config.status;
}

Selva.scroll.parallax.setPositionModifier = function(modifier) {
    Selva.scroll.modifier = modifier;
};

Selva.scroll.parallax.setEnd = function(end) {
    Selva.scroll.end = end;
};

Selva.scroll._move = function(event, delta) {
    if (Selva.scroll.blocked) return;

    Selva.scroll.multiplier = 0.1;
    Selva.scroll.top += delta * 30;
    Selva.scroll.direction = (delta > 0) ? 1 : -1;

    if (Selva.scroll.top >= Selva.scroll.start) Selva.scroll.top = Selva.scroll.start
    else if (Selva.scroll.top <= Selva.scroll.end) Selva.scroll.top = Selva.scroll.end;

    if (Selva.scroll.onScroll) Selva.scroll.onScroll(Selva.scroll.tweened);
};

function _animation() {
    animationFrame(_animation);

    if (Selva.scroll.debug) {
        $('#debug').text(Selva.scroll.tweened);
    }
    
    if (Selva.scroll.blocked) {
        Selva.scroll.top = Selva.scroll.tweened;
        return;
    }

    if (Math.ceil(Selva.scroll.tweened) !== Math.floor(Selva.scroll.top) &&
        parseFloat(Selva.scroll.tweened).toFixed(1) !== parseFloat(Selva.scroll.top).toFixed(1) ) {

        Selva.scroll.tweened += Selva.scroll.multiplier * (Selva.scroll.top - Selva.scroll.tweened);
    } else {
        Selva.scroll.tweened = Selva.scroll.top;
    }

    if (Selva.scroll.onMove) Selva.scroll.onMove(Selva.scroll.tweened);

    Selva.scroll.parallax();
};


Selva.scroll.parallax.modifier = function(config) {
    this.end = config.end;
    this.start = config.start;
    this.multiplier = config.multiplier;

    this.get_start = function() {
        return this.start;// + Selva.scroll.modifier;
    };

    this.get_end = function() {
        return this.end + Selva.scroll.modifier;
    };
};

Selva.scroll.parallax.element = function(config) {
    this.element = config.element;
    this.end = config.end;
    this.start = config.start;
    this.modifier = config.modifier;

    this.get_start = function() {
        return this.start;// + Selva.scroll.modifier;
    };

    this.get_end = function() {
        return this.end + Selva.scroll.modifier;
    };
};

window.selva = {};
window.selva.parallax = Selva.scroll.parallax;

window.selva.scroll = Selva.scroll;

})();