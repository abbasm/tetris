tetris lib
======

### A simple tetris javascript library, HTML5 canvas, for learning/educational purposes

DEMO : http://tetrislib.herokuapp.com

To create a Tetris object:

    var tetris = new Tetris(element);
        element => DOM element in which the tetris object should be placed
  
Start/Stop :

    tetris.stop()

Restart:

    tetris.restart()

Cursol key :

    tetris.keyPress(key)
        key => 'left' ← , 'right' → , 'down' ↓ , 'rotate' ↑
        Also flick & drag operations are enabled by default


