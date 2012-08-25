/*
 * Tetris Simple lib v0.2
 * Author Takashi Matsui, 2012 Summer
 * 
 */

(function (window){
    var document = window.document;
    
    var COLS = 10, ROWS = 15, BLOCK = 20, FLICK = 50;
    var shapes = [
        [ 1, 1, 1, 1 ],
        [ 1, 1, 1, 0,  1 ],
        [ 1, 1, 1, 0,  0, 0, 1 ],
        [ 1, 1, 0, 0,  1, 1 ],
        [ 1, 1, 0, 0,  0, 1, 1 ],
        [ 0, 1, 1, 0,  1, 1 ],
        [ 0, 1, 0, 0,  1, 1, 1 ]
    ];
    var colors = [
        'yellow', 'pink', 'lime', 'olive', 'navy', 'aqua', 'blue'
    ];

    function Tetris(dom){
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
        this.init();
        this.start();
        _canvas.addEventListener("touchstart", function(e){flick(e, _this)}, false);
        _canvas.addEventListener("touchmove", function(e){flick(e, _this)}, false);
        _canvas.addEventListener("touchend", function(e){flick(e, _this)}, false);
    }
    
    Tetris.prototype.restart = function(){
        if (this.timer1){
            clearInterval(this.timer1);
            clearInterval(this.timer2);
            this.timer1 = this.timer2 = null;
        }
        this.init();
        this.start();
    }
    
    Tetris.prototype.start = function(){
        this.timer1 = setInterval(tick, 1000, this);
        this.timer2 = setInterval(render, 1000/60, this);
        
    }
    
    Tetris.prototype.stop = function(){
        if (!this.timer1){
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
        var ctx = tetris.ctx;
        var board = tetris.board;
        var current = tetris.current;
        var currentX = tetris.currentX;
        var currentY = tetris.currentY;
        ctx.clearRect(0, 0, BLOCK * COLS, BLOCK * ROWS);
        ctx.strokeStyle = 'red';
        for (var x = 0; x < COLS; x++) {
            for (var y = 0; y < ROWS; y++) {
                if (board[y][x]) {
                    ctx.fillStyle = colors[board[y][x] - 1];
                    drawBlock(x, y, ctx);
                }
            }
        }
        for (var y = 0; y < 4; y++) {
            for (var x = 0; x < 4; x++) {
                if ( current[y][x] ) {
                    ctx.fillStyle = colors[current[y][x] - 1 ];
                    drawBlock(currentX + x, currentY + y, ctx);
                }
            }
        }
    }
    
    Tetris.prototype.newShape = function() {
        var id = Math.floor( Math.random() * shapes.length );
        var shape = shapes[id];
        this.current = [];
        this.currentX = 3;
        this.currentY = 0;
        
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
    
    Tetris.prototype.init = function() {
        for (var y = 0; y < ROWS; y++) {
            this.board[y] = [];
            for (var x = 0; x < COLS; x++) {
                this.board[y][x] = 0;
            }
        }
        this.newShape();
    }
    
    Tetris.prototype.freeze = function() {
        for (var y = 0; y < 4; y++) {
            for (var x = 0; x < 4; x++) {
                if (this.current[y][x]) {
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
        if (valid(tetris, 0, 1)) {
            tetris.currentY++;
        }
        else {
            if (tetris.currentY == 0){
                var gameover = document.createElement('div');
                gameover.innerHTML = tetris.name + 'ゲームオーバー';
                document.body.appendChild(gameover);
                clearInterval(tetris.timer1);
                clearInterval(tetris.timer2);
                tetris.timer1 = tetris.timer2 = null;
                return ;
            }
            tetris.freeze();
            tetris.clearLines();
            tetris.newShape();
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
    
    function valid(tetris, offsetX, offsetY, newCurrent) {
        offsetX = tetris.currentX + offsetX;
        offsetY = tetris.currentY + offsetY;
        var check = newCurrent || tetris.current;
        var board = tetris.board;
    
        for (var y = 0; y < 4; y++) {
            for (var x = 0; x < 4; x++) {
                if (check[y][x]) {
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
        switch (key) {
            case 'left':
                if (valid(this, -1, 0)) {
                    this.currentX--;
                }
                break;
            case 'right':
                if (valid(this, 1, 0)) {
                    this.currentX++;
                }
                break;
            case 'down':
                if (valid(this, 0, 1)) {
                    this.currentY++;
                }
                break;
            case 'rotate':
                var rotated = rotate(this.current);
                if (valid(this, 0, 0, rotated)) {
                    this.current = rotated;
                }
                break;
        }
    }
    
    function flick(e, obj) {
        e.preventDefault();
        var touch = e.touches[0];
        if(e.type == "touchstart"){
            obj.startX = touch.pageX;
            obj.startY = touch.pageY;
        }
        if(e.type == "touchmove"){
            obj.moveX = touch.pageX;
            obj.moveY = touch.pageY;
        }
        if(e.type == "touchend"){
            var diffX = obj.startX - obj.moveX;
            var diffY = obj.startY - obj.moveY;
            if (diffX > FLICK){
                obj.keyPress('left');
            } else if (diffX < -FLICK){
                obj.keyPress('right');
            } else if (diffY > FLICK){
                obj.keyPress('rotate');
            } else if (diffY < -FLICK){
                obj.keyPress('down');
            }
        }
    }


    window.Tetris = Tetris;
    
})(window);
