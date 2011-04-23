/*All code copyright 2010 by John Graham unless otherwise attributed*/

//this array tells the tile engine which offset in the tiles.png image to use
var maptilesArray = [ 
							71,71,70,71,71,71,71,71,71,
							135,135,92,135,135,135,135,135,135,
							72,72,90,72,72,72,72,72,72,
							134,134,91,134,134,134,134,134,134,
							70,70,70,70,70,70,70,70,70,
							71,71,70,71,71,71,71,71,71,
							71,71,70,71,71,71,71,71,71,
							71,71,70,71,71,71,71,71,71,
							71,71,70,71,71,71,71,71,71,
							71,71,70,71,71,71,71,71,71,
							135,135,92,135,135,135,135,135,135,
							72,72,90,72,72,72,72,72,72,
							134,134,91,134,134,134,134,134,134,
							70,70,70,70,70,70,70,70,70,
							71,71,70,71,71,71,71,71,71,
							71,27,70,71,71,49,50,71,71,
							71,22,70,71,71,66,66,73,71,
							71,71,70,71,71,71,71,71,71
						];
var decorationtilesArray = [ 
							0,0,0,0,0,0,0,0,0,
							0,0,0,0,0,0,0,0,0,
							0,0,0,0,0,0,0,0,0,
							0,0,44,0,0,0,0,0,0,
							0,0,0,0,0,0,0,0,0,
							0,0,0,0,0,0,0,0,0,
							0,0,0,0,0,0,0,0,0,
							0,0,0,0,0,0,0,0,0,
							0,0,0,0,0,45,0,0,0,
							0,0,0,0,0,0,0,0,0,
							0,0,0,0,0,0,0,0,0,
							0,0,9,0,0,0,0,0,0,
							0,0,0,0,0,0,0,0,0,
							0,0,0,0,0,0,0,0,0,
							0,0,0,0,0,0,0,0,0,
							0,0,0,0,0,0,0,0,0,
							0,0,0,0,0,0,0,0,0,
							0,0,0,0,0,0,0,0,0,
						];
var tilesPhysicsArray = [ 
							0,0,0,0,0,0,0,0,0,
							0,0,0,0,0,0,0,0,0,
							0,0,0,0,0,0,0,0,0,
							0,0,0,0,0,0,0,0,0,
							0,0,0,0,0,0,0,0,0,
							0,0,0,0,0,0,0,0,0,
							0,0,0,0,0,0,0,0,0,
							0,0,0,0,0,0,0,0,0,
							0,0,0,0,0,0,0,0,0,
							0,0,0,0,0,0,0,0,0,
							0,0,0,0,0,0,0,0,0,
							0,0,0,0,0,0,0,0,0,
							0,0,0,0,0,0,0,0,0,
							0,0,0,0,0,0,0,0,0,
							0,0,0,0,0,0,0,0,0,
							0,0,0,0,0,0,0,0,0,
							0,0,0,0,0,0,0,0,0,
							0,0,0,0,0,0,0,0,0,
						];

var setBytes = function(num1,num2,num3) {
    return (((num1 << 16) | num2) << 4) | num3;
};
var makeTilesArray = function(tiles_a, decor_a, phys_a){
	var tilesArray = new Array()
	var i = tiles_a.length
	while(i--){
		tilesArray[i] = setBytes(tiles_a[i], decor_a[i], phys_a[i]);
	}
	return tilesArray;
}
var tilesArray = makeTilesArray(maptilesArray, decorationtilesArray, tilesPhysicsArray)
Message.addMessage(tilesArray.length + ' Total Tiles to Load');

//function to detect canvas support by alterebro (http://code.google.com/p/browser-canvas-support/)
var canvas_support = {
	canvas_compatible : false,
	check_canvas : function() {
		try {
			this.canvas_compatible = !!(document.createElement('canvas').getContext('2d')); // S60
			} catch(e) {
			this.canvas_compatible = !!(document.createElement('canvas').getContext); // IE
		} 
		return this.canvas_compatible;
	}
} 

var Game = {
	gameTimer: 0, //holds id of main game timer
	tileEngine: 0, //holds tile engine object
	fps: 0, //target fps for game loop
	initGame: function() { //initialize game
		Game.fps = 250; //set target fps to 250
		Game.createTiles();
		Message.addMessage("Tiles Ready");
		Game.startTimer(); //start game loop
		Message.addMessage("Main Loop Started");
	},
	startTimer: function(){ //start game loop
		var interval = 1000 / Game.fps;
		Game.gameTimer = setInterval(Game.runLoop, interval);
	},
	runLoop: function(){ //code to run on each game loop
		Game.tileEngine.drawFrame();
		FPS.fps_count++;  //increments frame for fps display
	},
	createTiles: function(){ //create and initialize tile engine
		Game.tileEngine = newTileEngine(); //create tile engine object
		var mapObj = new Object(); //create tile engine initializer mapObject
			mapObj.canvas = document.getElementById('main_canvas');
			mapObj.ctx = mapObj.canvas.getContext('2d');
			mapObj.init_x = 0;
			mapObj.init_y = 0;
			mapObj.tileWidth = 32;
			mapObj.tileHeight = 32;
			mapObj.tilesWide = 9;
			mapObj.tilesHigh = 18;
			mapObj.zoneTilesWide = 3;
			mapObj.zoneTilesHigh = 3;
			mapObj.renderCircular = true;
			mapObj.sourceFile = 'tiles.png';
			mapObj.sourceTileCounts = 254;
			mapObj.sourceTileAccross = 22;
			mapObj.tilesArray = tilesArray;
		Game.tileEngine.setMapAttributes(mapObj);
		
		var spriteObj = new Object();
			spriteObj.init_x = 20;
			spriteObj.init_y = 20;
			spriteObj.movement_hash = {
				up: 	 [15,16,17,18,19,20,21],
				down:  [37,38,39,40,41,42,43],
				left:  [60,82,104,126,148,170,192],
				right: [59,81,103,125,147,169,191]
			}
		Game.tileEngine.setMainSpriteAttributes(spriteObj)
		
		Game.tileEngine.init();  //initialize tile engine object
	}
};

if(canvas_support.check_canvas()){  //check canvas support before intializing
	Game.initGame(); //initialize game object
}
else {
	Message.addMessage('Your Browser Does not support this app!');	
}

