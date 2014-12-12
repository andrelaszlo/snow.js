// TODO: refactor global variables
var WIDTH = 5;
var HEIGHT = 5;
var MAX_DEAD = 10;

var randomInt = function(max) {
    return Math.round(Math.random() * max);
};

var intersects = function(x1, y1, w1, h1, x2, y2, w2, h2) {
    return (
        x1+w1 >= x2 && x1 <= x2+w2 && y1+h1 >= y2 && y1 <= y2+h2
    );
};

var Flake = function(blocks, randomY) {
    var x, y, element;
    var speedY = 30.0 + Math.random() * 10; // px/s
    var speedX = Math.random() * 10 - 5;

    var style = "position: absolute; width: " + WIDTH + "px; height: " + HEIGHT + "px";

    var randomize = function(randomY) {
        if (randomY) {
            move(randomInt(window.innerWidth - WIDTH), randomInt(window.innerHeight - HEIGHT));
        } else {
            move(randomInt(window.innerWidth - WIDTH), -HEIGHT);
        }
    };

    var isOutside = function() {
        return (x + WIDTH < 0 ||
                x > window.innerWidth);
    };

    var tick = function(delta) {
        move(x + speedX/1000*delta, y + speedY/1000*delta);
        if (isOutside()) {
            randomize();
        }
        return !isDead();
    };

    var move = function(newX, newY) {
        x = newX;
        y = Math.min(newY, window.innerHeight - HEIGHT);
        element.css("left", "" + x + "px");
        element.css("top", "" + y + "px");
    };

    var isDead = function() {
        if (y+HEIGHT >= window.innerHeight) {
            return true;
        }
        var block, bx, by, bw, bh;
        for (var i = 0; i < blocks.length; i++) {
            block = blocks[i];

            bx = block[0];
            by = block[1];
            bw = block[2];
            bh = block[3];

            if (intersects(x, y, WIDTH, HEIGHT, bx, by, bw, bh)) {
                return true;
            }
        }
        return false;
    };

    var init = function(randomY) {
        element = $("<div class='flake' style='" + style + "'></div>");
        randomize(randomY);
        $('body').append(element);
    };

    var remove = function() {
        element.fadeOut(10000, function() {
            element.remove();
        });
    };

    init(randomY);

    return {
        tick: tick,
        remove: remove
    };
};

var Snow = function(number, blocks) {
    var flakes = [];
    var dead_flakes = [];
    var targets = {};

    for (var i = 0; i < number; i++) {
        flakes.push(new Flake(blocks, true));
    }

    var tick = function(delta) {
        var flake_states = {true: [], false: []};

        flakes.forEach(function(flake){
            flake_states[flake.tick(delta)].push(flake);
        });

        flakes = flake_states[true];
        dead_flakes = dead_flakes.concat(flake_states[false]);

        if (flakes.length < number) {
            flakes.push(new Flake(blocks));
        }

        while (dead_flakes.length > MAX_DEAD) {
            dead_flakes.shift().remove();
        }
    };

    return {
        tick: tick
    };
};

var LetItSnow = function (selector) {
    var snow, lastDraw, blocks;

    function tick() {
        var timestamp = +new Date();
        var delta = 0;

        if (lastDraw) {
            delta = timestamp - lastDraw;
        }

        lastDraw = timestamp;

        snow.tick(delta);

        window.requestAnimationFrame(tick);
    }

    var start = function() {
        $('body').css('overflow', 'hidden');

        if (selector) {
            blocks = $(selector).map(function(i, e){
                var $e = $(e);
                var pos = $e.position();
                var w = $e.width();
                var h = $e.height();
                return [[pos['left'], pos['top'], w, h]];
            });
        } else {
            blocks = [];
        }

        snow = new Snow(200, blocks);
        lastDraw = +new Date();
        window.requestAnimationFrame(tick);
    };

    return {
        start: start
    };
};

$(function() {
    snowy = new LetItSnow('.block');
    snowy.start();
});
