/**
 * creates a board
 *
 * @param w Width of the board
 * @param h Height of the board
 * @param m Number of mines on the board
 * @param canvas DOMString id of the canvas to draw the board on 
 *
 */

var Board = function(w, h, m, canvas) {
    this.settings = {
	"width": w,
	"height": h, 
	"mines": m,
	"canvas": "canvas"
    }

    if(this.getCtx() === null) {
	console.debug("'" + this.settings.canvas + "'"
		      + " isn't a valid canvas element");
    }

    this.generateBoard();
    this.generateOverlay();
    this.findAdjacents();

    this.printOverlay();
    this.printBoard();
    this.drawGrid();
    this.drawBoxes(true);
}


/**
 * Generates an overlay
 */
Board.prototype.generateOverlay = function() {
    var o = [];
    for(var i = 0; i < this.settings.height; i++) {
	o[i] = [];
	for(var j = 0; j < this.settings.width; j++) {
	    o[i][j] = true;
	}
    }

    this.overlay = o;
}

/**
 * Generates a board with mines 
 */ 
Board.prototype.generateBoard = function() {
    var blocks = [];
    var board = [];
    var m = this.settings.mines;

    for(var i = 0; 
	i < this.settings.width * this.settings.height; i++) {
	if(m > 0) {
	    blocks.push(-1);
	} else {
	    blocks.push(0);
	}
	m--;
    }


    for(var i = 0; i < this.settings.height; i++) {
	board[i] = [];
	for(var j = 0; j < this.settings.width; j++) {
	    board[i][j] 
		= blocks.splice(Math.random() * blocks.length, 1)[0];
	}
    }
    this.board = board;
}

/**
 * Finds adjacents mines to tiles
 */
Board.prototype.findAdjacents = function() {
    var adj = function(x,y) {
	return [
	    {x: x-1, y: y-1},
	    {x: x-1, y: y},
	    {x: x-1, y: y+1},
	    {x: x, y: y-1},
	    {x: x, y: y+1},
	    {x: x+1, y: y-1},
	    {x: x+1, y: y},
	    {x: x+1, y: y+1}
	];
    }

    // todo: flip this so a mine increments it's neighbours, instead
    // of we having to find mines adjacent
    for(var i = 0; i < this.board.length; i++) {
	for(var j = 0; j < this.board[i].length; j++) {

	    if(this.board[i][j] >= 0) {
		var as = adj(i,j);
		for(k in as) {
		    var p = as[k];
		    if(!(this.board[p.x] === undefined
		       || this.board[p.x][p.y] === undefined)
		       && this.board[p.x][p.y] < 0) {
			this.board[i][j]++;
		    }
		}
	    }
	}
    }
}

/**
 * prints board to console
 */ 
Board.prototype.printBoard = function() {
    var b = [];
    for(i in this.board) {
	b[i] = [];
	for (j in this.board[i]) {
	    if(this.board[i][j] < 0) {
		b[i][j] = "*";
	    } else {
		b[i][j] = this.board[i][j];
	    }
	    
	}
	b[i] = b[i].join(" ")
    }

    b = b.join("\n");
    console.debug(b);
}

/**
 * prints overlay to console
 */
Board.prototype.printOverlay = function () {
    var b = [];
    for(i in this.overlay) {
	b[i] = [];
	for (j in this.overlay[i]) {
	    if(this.overlay[i][j]) {
		b[i][j] = "#";
	    } else {
		b[i][j] = " ";
	    }
	    
	}
	b[i] = b[i].join(" ")
    }

    b = b.join("\n");
    console.debug(b);
}

/**
 * returns true if we've won
 */ 
Board.prototype.winCondition = function() {
    if(this.loseCondition()) {
	return false;
    }
    
    for(var i = 0; i < this.overlay.length; i++) {
	for(var j = 0; j < this.overlay[i].length; j++) {
	    if(this.overlay[i][j] && this.board[i][j] >= 0) {
		return false;
	    }
	}
    }
    return true;
}

/** 
 * returns true if we've lost
 */ 
Board.prototype.loseCondition = function() {
    for(var i = 0; i < this.settings.height; i++) {
	for(var j = 0; j < this.settings.width; j++) {
	    if(!this.overlay[i][j] && this.board[i][j] < 0) {
		return true;
	    }
	}
    }
    return true;
}

/**
 * Flips a tile on the board
 */ 
Board.prototype.flip = function (x,y) {
    if(this.overlay[x] === undefined || this.overlay[x][y]) {
	return;
    }
    this.overlay[x][y] = false;
}

/**
 * Returns the current canvas context
 */ 
Board.prototype.getCtx = function(){
    var canvas = document.getElementById(this.settings.canvas);
    if(canvas === null || canvas.getContext === undefined) {
	return null;
    } 
    return canvas.getContext("2d");
}


/**
 * Draws the board grid
 */
Board.prototype.drawGrid = function(){
    var line = function(context, x,y, x2,y2) {
	context.beginPath();
	context.moveTo(x,y);
	context.lineTo(x2,y2);
	context.closePath();
	context.stroke();
    }

    var c = this.getCtx();
    c.strokeStyle = "black";
    c.lineWidth = 2;

    for(var i = 0; i <= this.settings.height; i++) {
	line(c, 0, i*20, this.settings.width*20, i*20);
    }

    for(var i = 0; i <= this.settings.width; i++) {
	line(c, i * 20, 0, i * 20, this.settings.height * 20);
    }
}

/**
 * Draws boxes on the board
 */
Board.prototype.drawBoxes = function (hideOverlay){
    var c = this.getCtx();
    for(var i = 0; i < this.settings.height; i++) {
	for(var j = 0; j < this.settings.width; j++) {
	    c.fillStyle = "rgba(0,0,255, 0.1)";
	    c.font = "20px arial";
	    
	    if(this.overlay[i][j]) {
	    	c.fillRect(j*20 + 1, i*20 + 1, 19, 19);
	    }

	    c.fillStyle = "black";
	    if(this.board[i][j] < 0) {
		c.fillText("B", j*20 + 3, i*20 + 17, 15);
	    } else if (this.board[i][j] > 0){
		switch(this.board[i][j]) {
		    case 1: c.fillStyle = "blue"; break;
		    case 2: c.fillStyle = "green"; break;
		    case 3: c.fillStyle = "red"; break;
		    case 4: c.fillStyle = "darkblue"; break;
		    case 5: c.fillStyle = "magenta"; break;
		    case 6: c.fillStyle = "cyan"; break;
		    case 7: c.fillStyle = "black"; break;
		    case 8: c.fillStyle = "pink"; break;
		}
		c.fillText(this.board[i][j], j*20 + 3, i*20 + 17, 15);
	    }

	}
    }
}

window.onload = function() {
    b = new Board(30, 16, 99, can);
}
