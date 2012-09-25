/*
 * Simple Tetris library v0.25
 *     for learning/educational purposes
 * Author: Takashi Matsui, since 2012 Summer
 * https://github.com/tmatsui21/tetris
 */

(function (window){
    var document = window.document;
    
    var COLS = 10, ROWS = 15, BLOCK = 20, FLICK = 30;
    var shapes = [
        [ 0, 0, 0, 0,  1, 1, 1, 1 ],
        [ 0, 0, 0, 0,  1, 1, 1, 0,  1 ],
        [ 0, 0, 0, 0,  1, 1, 1, 0,  0, 0, 1 ],
        [ 0, 0, 0, 0,  0, 1, 1, 0,  0, 1, 1 ],
        [ 0, 0, 0, 0,  1, 1, 0, 0,  0, 1, 1 ],
        [ 0, 0, 0, 0,  0, 1, 1, 0,  1, 1 ],
        [ 0, 0, 0, 0,  0, 1, 0, 0,  1, 1, 1 ]
    ];
    var colors = [
        'yellow', 'pink', 'lime', 'olive', 'navy', 'aqua', 'blue'
    ];
        
    function Tetris(dom) {
        var _this = this;
        var _dom = dom || document.body;
        var _canvas = document.createElement('canvas');
        
        _canvas.width = BLOCK * COLS;
        _canvas.height = BLOCK * ROWS;
        _dom.appendChild(_canvas);
        
        this.ctx = _canvas.getContext('2d');
        this.board = [];
        this.current = null;
        this.currentX = this.currentY = 0;
        this.timer1 = this.timer2 = null;
        this.dom = _dom;
        
        _canvas.addEventListener('touchstart', function(e) { flick(e, _this); }, false);
        _canvas.addEventListener('touchmove', function(e) { flick(e, _this); }, false);
        _canvas.addEventListener('touchend', function(e) { flick(e, _this); }, false);
        _canvas.addEventListener('mousedown', function(e) { drag(e, _this); }, false);
        _canvas.addEventListener('mousemove', function(e) { drag(e, _this); }, false);
        _canvas.addEventListener('mouseup', function(e) { drag(e, _this); }, false);
        
        this.init();
        this.start();
    }
    
    Tetris.prototype.init = function() {
        for (var y = 0; y < ROWS; y++) {
            this.board[y] = [];
            for (var x = 0; x < COLS; x++) {
                this.board[y][x] = 0;
            }
        }
        this.newTetrimino();
    }
    
    Tetris.prototype.restart = function() {
        if (this.timer1) {
            clearInterval(this.timer1);
            clearInterval(this.timer2);
            this.timer1 = this.timer2 = null;
        }
        var rmobj = this.dom.getElementsByTagName('div');
        if (rmobj[0]) {
            this.dom.removeChild(rmobj[0]);
        }
        this.init();
        this.start();
    }
    
    Tetris.prototype.start = function() {
        if (isValid(this, 0, 1)) {
            var _this = this;
            this.timer1 = setInterval(function() { tick(_this); }, 1000);
            this.timer2 = setInterval(function() { render(_this); }, 1000/60);
        }
    }
    
    Tetris.prototype.stop = function() {
        if (!this.timer1) {
            this.start();
        } else {
            clearInterval(this.timer1);
            clearInterval(this.timer2);
            this.timer1 = this.timer2 = null;
        }
    }
    
    function drawBlock(x, y, ctx) {
        ctx.fillRect(BLOCK * x, BLOCK * y, BLOCK - 1, BLOCK - 1);
        ctx.strokeRect(BLOCK * x, BLOCK * y, BLOCK - 1, BLOCK - 1);
    }
    
    function render(tetris) {
        var _ctx = tetris.ctx;
        var _board = tetris.board;

        _ctx.clearRect(0, 0, BLOCK * COLS, BLOCK * ROWS);
        _ctx.strokeStyle = 'red';
        for (var x = 0; x < COLS; x++) {
            for (var y = 0; y < ROWS; y++) {
                if (_board[y][x]) {
                    _ctx.fillStyle = colors[_board[y][x] - 1];
                    drawBlock(x, y, _ctx);
                }
            }
        }
        for (var y = 0; y < 4; y++) {
            for (var x = 0; x < 4; x++) {
                if (tetris.current[y][x] && (y + tetris.currentY) >= 0) {
                    _ctx.fillStyle = colors[tetris.current[y][x] - 1 ];
                    drawBlock(x + tetris.currentX, y + tetris.currentY, _ctx);
                }
            }
        }
    }
    
    Tetris.prototype.newTetrimino = function() {
        var id = Math.floor( Math.random() * shapes.length );
        var shape = shapes[id];
        this.current = [];
        this.currentX = 3;
        this.currentY = -2;
        
        for (var y = 0; y < 4; y++) {
            this.current[y] = [];
            for (var x = 0; x < 4; x++) {
                var i = 4 * y + x;
                if (typeof shape[i] != 'undefined' && shape[i]) {
                    this.current[y][x] = id + 1;
                }
                else {
                    this.current[y][x] = 0;
                }
            }
        }
    }
    
    Tetris.prototype.freeze = function() {
        for (var y = 0; y < 4; y++) {
            for (var x = 0; x < 4; x++) {
                if (this.current[y][x] && (y + this.currentY) >= 0) {
                    this.board[y + this.currentY][x + this.currentX] = this.current[y][x];
                }
            }
        }
    }
    
    Tetris.prototype.clearLines = function() {
        for (var y = ROWS - 1; y >= 0; y--) {
            for (var x = 0; x < COLS; x++) {
                if (this.board[ y ][ x ] == 0) {
                    break;
                }
            }
            if (x == COLS) {
                for (var yy = y; yy > 0; yy--) {
                    for (var x = 0; x < COLS; x++) {
                        this.board[yy][x] = this.board[yy - 1][x];
                    }
                }
                y++;
            }
        }
    }
    
    function tick(tetris) {
        if (isValid(tetris, 0, 1)) {
            tetris.currentY++;
        }
        else {
            if (tetris.currentY <= -1) {
                var gameover = document.createElement('div');
                gameover.innerHTML = tetris.name + 'ゲームオーバー';
                tetris.dom.appendChild(gameover);
                clearInterval(tetris.timer1);
                clearInterval(tetris.timer2);
                tetris.timer1 = tetris.timer2 = null;
                return ;
            }
            tetris.freeze();
            tetris.clearLines();
            tetris.newTetrimino();
        }
    }
    
    function rotate(current) {
        var newCurrent = [];
        for (var y = 0; y < 4; y++) {
            newCurrent[y] = [];
            for (var x = 0; x < 4; x++) {
                newCurrent[y][x] = current[3 - x][y];
            }
        }
    
        return newCurrent;
    }
    
    function isValid(tetris, offsetX, offsetY, newCurrent) {
        offsetX = tetris.currentX + offsetX;
        offsetY = tetris.currentY + offsetY;
        var _current = newCurrent || tetris.current;
        var board = tetris.board;
    
        for (var y = 0; y < 4; y++) {
            for (var x = 0; x < 4; x++) {
                if (_current[y][x] && (y + offsetY) >= 0) {
                    if (typeof board[y + offsetY] == 'undefined'
                      || typeof board[y + offsetY][x + offsetX] == 'undefined'
                      || board[y + offsetY][x + offsetX]
                      || x + offsetX < 0
                      || y + offsetY >= ROWS
                      || x + offsetX >= COLS) {
                        return false;
                    }
                }
            }
        }
        return true;
    }
    
    Tetris.prototype.keyPress = function(key) {
        if (this.currentY < -1) {
            return ;
        }
        switch (key) {
            case 'left':
                if (isValid(this, -1, 0)) {
                    this.currentX--;
                }
                break;
            case 'right':
                if (isValid(this, 1, 0)) {
                    this.currentX++;
                }
                break;
            case 'down':
                if (isValid(this, 0, 1)) {
                    this.currentY++;
                }
                break;
            case 'rotate':
                var rotated = rotate(this.current);
                if (isValid(this, 0, 0, rotated)) {
                    this.current = rotated;
                }
                break;
        }
    }
    
    function flick(e, obj) {
        e.preventDefault();
        var touch = e.touches[0];
        if (e.type == 'touchstart') {
            obj.startX = touch.pageX;
            obj.startY = touch.pageY;
        }
        if (e.type == 'touchmove') {
            obj.moveX = touch.pageX;
            obj.moveY = touch.pageY;
        }
        if (e.type == 'touchend') {
            var diffX = obj.startX - obj.moveX;
            var diffY = obj.startY - obj.moveY;
            if (diffX > FLICK) {
                obj.keyPress('left');
            } else if (diffX < -FLICK) {
                obj.keyPress('right');
            } else if (diffY > FLICK) {
                obj.keyPress('rotate');
            } else if (diffY < -FLICK) {
                obj.keyPress('down');
            }
        }
    }
    
    var drag = (function() {
        var drag = false;
        var startX = startY = diffX = diffY = 0;
        var x = y = 0;
        return function(e, obj) {
            e.preventDefault();
            if (e.type == 'mousedown') {
                drag = true;
                startX = e.x;
                startY = e.y;
            }
            if (drag == true) {
                if (e.type == 'mouseup') {
                    drag = false;
                    diffX = startX - x;
                    diffY = startY - y;
                    if (diffX > FLICK) {
                        obj.keyPress('left');
                    } else if (diffX < -FLICK) {
                        obj.keyPress('right');
                    } else if (diffY > FLICK) {
                        obj.keyPress('rotate');
                    } else if (diffY < -FLICK) {
                        obj.keyPress('down');
                    }
                }
                if (e.type == 'mousemove') {
                    x = e.x;
                    y = e.y;
                }
            }
        };
    })();
        
    window.Tetris = Tetris;
    
})(window);
