var board;

// board ---------------------------------------------------------------------

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
	"overlay": true,
	"canvas": "canvas"
    }

    if(this.getCtx() === null) {
	console.debug("'" + this.settings.canvas + "'"
		      + " isn't a valid canvas element");
	return;
    }
    
    bindEvents(this.settings.canvas);
    this.newGame();
}


/**
 * Starts a new game
 */
Board.prototype.newGame = function() {
    this.generateBoard();
    this.generateOverlay();
    this.findAdjacents();

    this.drawGrid();
    this.drawBoxes();
}

Board.prototype.firstMove = function() {
    for(var i = 0; i < this.settings.height; i++) {
	for(var j = 0; j < this.settings.width; j++) {
	    if(!this.overlay[i][j]) {
		return false;
	    }
	}
    }
    return true;
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
 *
 * WARNING: currently NOT checking if the tile exists
 */ 
Board.prototype.flip = function (x,y) {
    if(this.board[x][y] < 0 && this.firstMove()) {
	this.newGame();
	return this.flip(x,y);
    }
    var p = {"x": x, "y": y};


    var as = [];
    while(p != undefined) {
	if(this.board[p.x][p.y] == 0 && this.overlay[p.x][p.y]) {
	    var newAs = adjacent(p.x,p.y);

	    for(var pos = newAs.pop(); pos != undefined; pos = newAs.pop()) {
		
		if(this.overlay[pos.x] != undefined
		  && this.overlay[pos.x][pos.y] != undefined
		  && this.overlay[pos.x][pos.y]) {
		    as.push(pos);
		}
	    }
	    console.debug(as);
	}

	this.overlay[p.x][p.y] = false;
	p = as.pop();
    }

    this.redraw();
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
 * redraws entire board
 */ 
Board.prototype.redraw = function (){
    var c = this.getCtx();
    c.clearRect(0, 0, this.settings.width*20, this.settings.height*20);
    this.drawGrid();
    this.drawBoxes();
}

/**
 * Draws the board grid
 */
Board.prototype.drawGrid = function(){
    var line = function(context, x,y, x2,y2) {
	
	context.moveTo(x,y);
	context.lineTo(x2,y2);
    }

    var c = this.getCtx();
    
    c.strokeStyle = "black";
    c.lineWidth = 2;
    c.beginPath();
    
    for(var i = 0; i <= this.settings.height; i++) {
	line(c, 0, i*20, this.settings.width*20, i*20);
    }

    for(var i = 0; i <= this.settings.width; i++) {
	line(c, i * 20, 0, i * 20, this.settings.height * 20);
    }
    
    c.closePath();
    c.stroke();
}

/**
 * Draws boxes on the board
 */
Board.prototype.drawBoxes = function (hideOverlay){
    var c = this.getCtx();
    for(var i = 0; i < this.settings.height; i++) {
	for(var j = 0; j < this.settings.width; j++) {
	    c.fillStyle = "rgba(0,0,255, 0.3)";
	    c.font = "bold 20px verdana";
	    
	    if(this.overlay[i][j] && this.overlay) {
	    	c.fillRect(j*20 + 1, i*20 + 1, 19, 19);

	    } else if(this.board[i][j] < 0) {
		c.fillStyle = "black";
		c.fillText("#", j*20 + 3, i*20 + 17, 15);

	    } else if (this.board[i][j] > 0){
		switch(this.board[i][j]) {
		    case 1: c.fillStyle = "blue"; break;
		    case 2: c.fillStyle = "green"; break;
		    case 3: c.fillStyle = "red"; break;
		    case 4: c.fillStyle = "purple"; break;
		    case 5: c.fillStyle = "maroon"; break;
		    case 6: c.fillStyle = "turquoise"; break;
		    case 7: c.fillStyle = "black"; break;
		    case 8: c.fillStyle = "gray"; break;
		}
		c.fillText(this.board[i][j], j*20 + 3, i*20 + 17, 15);
	    }
	}
    }
}
// Helpers -------------------------------------------------------------------
/**
 * Fetches mouse position in the current context from an event
 */
var getPos = function (e) {
    return {
	y: Math.floor((e.pageX - e.target.offsetLeft) / 20), 
	x: Math.floor((e.pageY - e.target.offsetTop) / 20)
    };
}

/**
 * Finds all eight tiles adjacent to, but not including, [x][y]
 */
var adjacent = function (x,y) {
    return [{x: x-1, y: y-1},
	    {x: x-1, y: y},
	    {x: x-1, y: y+1},
	    {x: x,   y: y-1},
	    {x: x,   y: y+1},
	    {x: x+1, y: y-1},
	    {x: x+1, y: y},
	    {x: x+1, y: y+1}];
}

// events --------------------------------------------------------------------
var events = {
    mouseout: function (e) {
	var p = getPos(e);
	console.debug("mouseout: ", p);
    },
    mousemove: function (e){
	var p = getPos(e);
	//console.debug("mouseover: ", p);
    },
    click: function(e) {
	e.preventDefault();
	var p = getPos(e);
	console.debug("click: ", p);
	board.flip(p.x, p.y);
    }
}

bindEvents = function(canvas){
    var c = document.getElementById(canvas);
    c.onclick = events.click;
    c.onmousemove = events.mousemove;
    c.onmouseout = events.mouseout;   

}


// main ----------------------------------------------------------------------


window.onload = function() {
    board = new Board(30, 16, 99, "canvas");
}
