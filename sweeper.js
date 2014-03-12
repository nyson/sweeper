/**
 * 
 */

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
    var settings = {
	"width": w,
	"height": h, 
	"mines": m,
	"overlay": true,
	"canvas": "canvas"
    }

    const HIDDEN = 0;
    const VISIBLE = 1;
    const FLAG = 2;

    const MINE = -1;
    const CLEAR = 0;


    Board.prototype.construct = function() {
	if(this.getCtx() === null) {
	    console.debug("'" + settings.canvas + "'"
			  + " isn't a valid canvas element");
	    return;
	}
	
	bindEvents(settings.canvas);
	this.newGame();
    }


// methods -------------------------------------------------------------------    

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
	for(var i = 0; i < settings.height; i++) {
	    for(var j = 0; j < settings.width; j++) {
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
	for(var i = 0; i < settings.height; i++) {
	    o[i] = [];
	    for(var j = 0; j < settings.width; j++) {
		o[i][j] = HIDDEN;
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
	var m = settings.mines;

	for(var i = 0; 
	    i < settings.width * settings.height; i++) {
	    if(m > 0) {
		blocks.push(MINE);
	    } else {
		blocks.push(CLEAR);
	    }
	    m--;
	}


	for(var i = 0; i < settings.height; i++) {
	    board[i] = [];
	    for(var j = 0; j < settings.width; j++) {
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
			if(this.board[p.x][p.y] === MINE) {
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
		if(this.board[i][j] === MINE) {
		    b[i][j] = "*";
		} else {
		    b[i][j] = this.board[i][j];
		}
		
	    }
	    b[i] = b[i].join(" ")
	}

	console.debug(b.join("\n"));
    }

    /**
     * prints overlay to console
     */
    Board.prototype.printOverlay = function () {
	var b = [];
	for(i in this.overlay) {
	    b[i] = [];
	    for (j in this.overlay[i]) {
		switch(this.overlay[i][j]) {
		case HIDDEN:
		    b[i][j] = "#";
		    break;

		case VISIBLE: 
		    b[i][j] = " ";
		    break;
		    
		case FLAG:
		    b[i][j] = "F";
		    break;
		    
		}
	    }
	    b[i] = b[i].join(" ")
	}

	console.debug(b.join("\n"));
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
		if(this.overlay[i][j] === HIDDEN 
		   && this.board[i][j] >= 0) {
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
	for(var i = 0; i < settings.height; i++) {
	    for(var j = 0; j < settings.width; j++) {
		if(this.overlay[i][j] === VISIBLE 
		   && this.board[i][j] === MINE) {
		    return true;
		}
	    }
	}
	return true;
    }
    

    Board.prototype.flag = function(x,y) {
	if(this.overlay[x][y] === HIDDEN) {
	    this.overlay[x][y] = FLAG;
	} else if(this.overlay[x][y] === FLAG) {
	    this.overlay[x][y] = HIDDEN;
	}

	this.redraw();
    }
    /**
     * Flips a tile on the board
     *
     * WARNING: currently NOT checking if the tile exists
     */ 
    Board.prototype.flip = function (x,y) {
	// doesn't work anymore; WHYYYYYYY 
	if(this.board[x][y] === MINE && this.firstMove()) {
	    this.newGame();
	    return this.flip(x,y);
	}

	// can't flip flags!
	if(this.overlay[x][y] === FLAG) {
	    return;
	}
	

	// broken near edges
	if(this.overlay[x][y] === VISIBLE) {
	    var as = adjacent(x,y);
	    var nearFlags = 0;
	    for(i in as) {
		if(this.overlay[as[i].x][as[i].y] === FLAG) {
		    nearFlags++;
		}
	    }
	    
	    if(nearFlags === this.board[x][y]) {
		for(i in as) {
		    if(this.overlay[as[i].x][as[i].y] === HIDDEN) {
			this.flip(as[i].x, as[i].y);
		    }
		}
	    }
	}
	var p = {"x": x, "y": y};
	var as = [];
	while(p != undefined) {
	    if(this.board[p.x][p.y] === CLEAR 
	       && this.overlay[p.x][p.y] === HIDDEN) {
		var newAs = adjacent(p.x,p.y);

		for(var pos = newAs.pop(); pos != undefined; pos = newAs.pop()) {
		    if(this.overlay[pos.x][pos.y] === HIDDEN) {
			as.push(pos);
		    }
		}
	    }

	    this.overlay[p.x][p.y] = VISIBLE;
	    p = as.pop();
	}

	this.redraw();
    }

    /**
     * Returns the current canvas context
     */ 
    Board.prototype.getCtx = function(){
	var canvas = document.getElementById(settings.canvas);
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
	c.clearRect(0, 0, settings.width*20, settings.height*20);
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
	
	for(var i = 0; i <= settings.height; i++) {
	    line(c, 0, i*20, settings.width*20, i*20);
	}

	for(var i = 0; i <= settings.width; i++) {
	    line(c, i * 20, 0, i * 20, settings.height * 20);
	}
	
	c.closePath();
	c.stroke();
    }
    
    /**
     * Draws boxes on the board
     */
    Board.prototype.drawBoxes = function (hideOverlay){
	var c = this.getCtx();
	for(var i = 0; i < settings.height; i++) {
	    for(var j = 0; j < settings.width; j++) {
		c.fillStyle = "rgba(0,0,255, 0.3)";
		c.font = "bold 20px verdana";
		
		if(this.overlay[i][j] !== VISIBLE) {
	    	    c.fillRect(j*20 + 1, i*20 + 1, 19, 19);
		    if(this.overlay[i][j] === FLAG) {
			c.fillStyle = "red";
			c.fillText("F", j*20 + 3, i*20 + 17, 15);
		    }

		} else if(this.board[i][j] === MINE) {
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
    var exists = function() {
	if(arguments.length == 1) {
	    x = arguments[0].x;
	    y = arguments[0].y;

	} else if(arguments.length == 2) {
	    x = arguments[0];
	    y = arguments[1];

	} else {
	    return false;
	}

	return y >= 0 && y < settings.width
	    && x >= 0 && x < settings.height;
    }
    
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
	var ps = [{x: x-1, y: y-1},
		{x: x-1, y: y},
		{x: x-1, y: y+1},
		{x: x,   y: y-1},
		{x: x,   y: y+1},
		{x: x+1, y: y-1},
		{x: x+1, y: y},
		{x: x+1, y: y+1}];

	var existing = [];
	
	for(i in ps) {
	    if(exists(ps[i])) {
		existing[i] = ps[i];
	    }
	}
	
	return existing;
    }

    // events --------------------------------------------------------------------
    var events = {
	mouseout: function (e) {
	    var p = getPos(e);
	},
	mousemove: function (e){
	    var p = getPos(e);
	},
	click: function(e) {
	    var p = getPos(e);
	    switch (event.button) {
	    case 2: 
		var p = getPos(e);
		board.flag(p.x, p.y);
		break;
	    case 0:
		e.preventDefault();
		board.flip(p.x, p.y);
		break;
	    } 
	}
    }
	
    bindEvents = function(canvas){
	var c = document.getElementById(canvas);
	c.oncontextmenu = function() {return false;}
	c.onmousedown = events.click;
	c.onmousemove = events.mousemove;
	c.onmouseout = events.mouseout;   

    }

    this.construct();
}

// main ----------------------------------------------------------------------

window.onload = function() {
    board = new Board(30, 16, 99, "canvas");
}
