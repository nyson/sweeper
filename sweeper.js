/**
 * Simple 
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
	"canvas": canvas
    };
    
    Board.prototype.construct = function() {
	this.firstMove = true;
	
	// error
	this.OUT_OF_BOUNDS = -99;

	// overlay values
	this.HIDDEN = 0;
	this.VISIBLE = 1;
	this.FLAG = 2;
	
	// board values
	this.MINE = -1;
	this.CLEAR = 0;
	
	if(this.getCtx() === null) {	    
	    console.debug("'" + settings.canvas + "'" + 
			  " isn't a valid canvas element");
	    return;
	}
	
	bindEvents(settings.canvas);
	this.newGame();
    };


// methods -------------------------------------------------------------------    

    /**
     * Starts a new game
     */
    Board.prototype.newGame = function() {
	firstMove = true;
	this.generateBoard();
	this.generateOverlay();
	this.findAdjacents();

	this.redraw();
    };

    /**
     * Generates an overlay
     */
    Board.prototype.generateOverlay = function() {
	var o = [];
	for(var i = 0; i < settings.height; i++) {
	    o[i] = [];
	    for(var j = 0; j < settings.width; j++) {
		o[i][j] = this.HIDDEN;
	    }
	}

	this.overlay = o;
    };

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
		blocks.push(this.MINE);
	    } else {
		blocks.push(this.CLEAR);
	    }
	    m--;
	}


	for(i = 0; i < settings.height; i++) {
	    board[i] = [];
	    for(var j = 0; j < settings.width; j++) {
		board[i][j] = 
		    blocks.splice(Math.random() * blocks.length, 1)[0];
	    }
	}
	this.board = board;
    };

    /**
     * Finds adjacents mines to tiles
     */
    Board.prototype.findAdjacents = function() {
	// todo: flip this so a mine increments it's neighbours, instead
	// of we having to find mines adjacent
	for(var i = 0; i < this.board.length; i++) {
	    for(var j = 0; j < this.board[i].length; j++) {

		if(this.board[i][j] >= 0) {
		    var as = adjacent(i,j);
		    for(var k in as) {
			if(this.board[as[k].x][as[k].y] === this.MINE) {
			    this.board[i][j]++;
			}
		    }
		}
	    }
	}
    };

    /**
     * prints board to console
     */ 
    Board.prototype.printBoard = function() {
	var b = [];
	for(var i in this.board) {
	    b[i] = [];
	    for (var j in this.board[i]) {
		if(this.board[i][j] === this.MINE) {
		    b[i][j] = "*";
		} else {
		    b[i][j] = this.board[i][j];
		}
		
	    }
	    b[i] = b[i].join(" ");
	}
    };

    /**
     * prints overlay to console
     */
    Board.prototype.printOverlay = function () {
	var b = [];
	for(var i in this.overlay) {
	    b[i] = [];
	    for (var j in this.overlay[i]) {
		switch(this.overlay[i][j]) {
		case this.HIDDEN:
		    b[i][j] = "#";
		    break;

		case this.VISIBLE: 
		    b[i][j] = " ";
		    break;
		    
		case this.FLAG:
		    b[i][j] = "F";
		    break;
		    
		}
	    }
	    b[i] = b[i].join(" ");
	}
    };

    /**
     * returns true if we've won
     */ 
    Board.prototype.winCondition = function() {
	if(this.loseCondition()) {
	    return false;
	}
	
	for(var i = 0; i < this.overlay.length; i++) {
	    for(var j = 0; j < this.overlay[i].length; j++) {
		if(this.overlay[i][j] === this.HIDDEN && 
		   this.board[i][j] >= 0) {
		    return false;
		}
	    }
	}
	return true;
    };

    /** 
     * returns true if we've lost
     */ 
    Board.prototype.loseCondition = function() {
	for(var i = 0; i < settings.height; i++) {
	    for(var j = 0; j < settings.width; j++) {
		if(this.overlay[i][j] === this.VISIBLE && 
		   this.board[i][j] === this.MINE) {
		    return true;
		}
	    }
	}
	return false;
    };
    
    /**
     * Flags an overlay for indicating the prescence of a DANGEROUS MINE!
     */
    Board.prototype.flag = function(x,y) {
	if(this.overlay[x][y] === this.HIDDEN) {
	    this.overlay[x][y] = this.FLAG;
	} else if(this.overlay[x][y] === this.FLAG) {
	    this.overlay[x][y] = this.HIDDEN;
	}

	this.redraw();
    };
    
    Board.prototype.solve = function() {
	for(var i = 0; i < settings.height; i++) {
	    for(var j = 0; j < settings.width; j++) {
		this.overlay[i][j] = 
		    this.board[i][j] === this.MINE ? this.FLAG : this.VISIBLE;
		
	    }
	}

	this.redraw();
    };

    /**
     * Reads the board and makes a rule decision based on current state
     */
    Board.prototype.gameRules = function() {
	if(this.loseCondition()) {
	    alert("You've lost!\nI'm starting a new game");
	    this.newGame();

	} else if (this.winCondition()) {
	    alert("You've won! Congratulations!\n" + 
		  "I'm starting a new game for you");
	    this.newGame();
	}
    };

    /**
     * Flips up to 8 adjacent tiles (horizontally, vertically and diagonally)
     * from a center tile
     */
    Board.prototype.flipVisible  = function (x,y) {
	var as = adjacent(x,y);
	var nearFlags = 0;
	for(var i in as) {
	    if(this.overlay[as[i].x][as[i].y] === this.FLAG) {
		nearFlags++;
	    }
	}
	
	if(nearFlags === this.board[x][y]) {
	    for(i in as) {
		if(this.overlay[as[i].x][as[i].y] === this.HIDDEN) {
		    this.flip(as[i].x, as[i].y);
		}
	    }
	}
    };

    /**
     * Flips a tile that has not yet been revealed
     */
    Board.prototype.flipHidden = function(x,y) {
	var p = {"x": x, "y": y};
	var as = [];
	while(p !== undefined) {
	    if(this.board[p.x][p.y] === this.CLEAR && 
	       this.overlay[p.x][p.y] === this.HIDDEN) {
		var newAs = adjacent(p.x, p.y);
		
		for(var pos = newAs.pop(); pos !== undefined; 
		    pos = newAs.pop()) {
		    if(this.overlay[pos.x][pos.y] === this.HIDDEN) {
			as.push(pos);
		    }
		}
	    }

	    this.overlay[p.x][p.y] = this.VISIBLE;
	    p = as.pop();
	}
    };

    /**
     * Flips a tile on the board
     */ 
    Board.prototype.flip = function (x,y) {
	if(this.board[x][y] === this.MINE && this.firstMove) {
	    this.newGame();
	    return this.flip(x,y);

	} else {
	    this.firstMove = false;
	}

	if(this.overlay[x][y] === this.FLAG) {
	    return;
	}
	
	if(this.overlay[x][y] === this.VISIBLE) {
	    this.flipVisible(x,y);
	} else if(this.overlay[x][y] === this.HIDDEN) {
	    this.flipHidden(x,y);
	}
	
	this.redraw();
	this.gameRules();
    };

    /**
     * Returns the current canvas context
     */ 
    Board.prototype.getCtx = function(){
	var canvas = document.getElementById(settings.canvas);
	if(canvas === null || canvas.getContext === undefined) {
	    return null;
	} 
	return canvas.getContext("2d");
    };


    /**
     * redraws entire board
     */ 
    Board.prototype.redraw = function (){
	var c = this.getCtx();
	c.clearRect(0, 0, settings.width*20, settings.height*20);
	this.drawGrid();
	this.drawBoxes();
    };

    /**
     * Draws the board grid
     */
    Board.prototype.drawGrid = function(){
	var c = this.getCtx();
	var line = function(x,y, x2,y2) {
	    c.moveTo(x,y);
	    c.lineTo(x2,y2);
	};

	
	c.strokeStyle = "black";
	c.lineWidth = 2;
	c.beginPath();
	
	for(var i = 0; i <= settings.height; i++) {
	    line(0, i*20, settings.width*20, i*20);
	}

	for(i = 0; i <= settings.width; i++) {
	    line(i * 20, 0, i * 20, settings.height * 20);
	}
	
	c.closePath();
	c.stroke();
    };
    
    /**
     * Draws boxes on the board
     */
    Board.prototype.drawBoxes = function (hideOverlay){
	var c = this.getCtx();
	for(var i = 0; i < settings.height; i++) {
	    for(var j = 0; j < settings.width; j++) {
		c.fillStyle = "rgba(0,0,255, 0.3)";
		c.font = "bold 20px verdana";
		
		if(this.overlay[i][j] !== this.VISIBLE) {
	    	    c.fillRect(j*20 + 1, i*20 + 1, 19, 19);
		    if(this.overlay[i][j] === this.FLAG) {
			c.fillStyle = "red";
			c.fillText("F", j*20 + 3, i*20 + 17, 15);
		    }

		} else if(this.board[i][j] === this.MINE) {
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
    };

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

	return y >= 0 && y < settings.width && 
	    x >= 0 && x < settings.height;
    };
    
    /**
     * Fetches mouse position in the current context from an event
     */
    var getMousePos = function (e) {
	return {
	    y: Math.floor((e.pageX - e.target.offsetLeft) / 20), 
	    x: Math.floor((e.pageY - e.target.offsetTop) / 20)
	};
    };
    
    /**
     * Creates a positional object
     */ 
    var pos = function(x,y) {return {'x':x, 'y':y};};

    /**
     * Finds all eight tiles adjacent to, but not including, (x,y)
     */
    var adjacent = function (x,y) {
	var existing = [];
	var ps = [{x: x-1, y: y-1}, {x: x-1, y: y}, {x: x-1, y: y+1},
		{x: x,   y: y-1}, {x: x,   y: y+1},
		{x: x+1, y: y-1}, {x: x+1, y: y}, {x: x+1, y: y+1}];

	for(var i in ps) {
	    if(exists(ps[i])) {
		existing.push(ps[i]);
	    } 
	}

	return existing;
    };

    // events --------------------------------------------------------------------
    var events = {
	mouseout: function (e) {
	    var p = getMousePos(e);
	},
	mousemove: function (e){
	    var p = getMousePos(e);
	},
	click: function(e) {
	    var p = getMousePos(e);
	    switch (event.button) {
	    case 2: 
		p = getMousePos(e);
		board.flag(p.x, p.y);
		break;
	    case 0:
		e.preventDefault();
		board.flip(p.x, p.y);
		break;
	    } 
	}
    };
	
    bindEvents = function(canvas){
	var c = document.getElementById(canvas);
	c.oncontextmenu = function() {return false;};
	c.onmousedown = events.click;
	c.onmousemove = events.mousemove;
	c.onmouseout = events.mouseout;   

    };

    this.construct();
};

// main ----------------------------------------------------------------------

window.onload = function() {
    board = new Board(30, 16, 99, "canvas");
};
