/*copyright 2010 by John Graham*/

function newMouse(){
	var Mouse = {
			contex: 0,down: false,offsetx: 0,offsety: 0,timer: 0,accelx: 0,accely: 0,
			clickposx: 0,clickposy: 0,tileEngine:0,
			init: function(context, tileEngine) {
					Mouse.context = context || window
					Mouse.tileEngine = tileEngine;
					$(Mouse.context).mousedown(function(event)  {Mouse.setClickPos(event)});
					$(Mouse.context).mouseup(function()  {Mouse.down = false;});
					$(Mouse.context).mouseout(function() {Mouse.down = false;});
					$(Mouse.context).mousemove(function(event) {Mouse.move(event);});
			},
			isDown: function() {return Mouse.down;},
			setClickPos: function(event) { 
				Mouse.clickposx = event.screenX;
				Mouse.clickposy = event.screenY;
				Mouse.down = true;
			},
			move: function(event) {
					if (Mouse.isDown()) {
							Mouse.timer++;
							Mouse.offsetx = event.screenX - Mouse.clickposx;
							Mouse.offsety = event.screenY - Mouse.clickposy;
							Mouse.setClickPos(event);
							Mouse.accelx = Mouse.offsetx / Mouse.timer;
							Mouse.accely = Mouse.offsety / Mouse.timer;
					} else {
							Mouse.reset();
					}
			},
			reset: function() {
					Mouse.offsetx = 0;
					Mouse.offsety = 0;
					Mouse.accelx = 0;
					Mouse.accely = 0;
					Mouse.timer = 0;
			}
	};
	return Mouse;
}
function newSourceImage(){ //image used to create tile 
	var SourceImage = {
		imageFilename: 0, //filename for image
		image: 0, //dom image object
		is_ready: 0, //is image loaded and ready to be drawn
		init: function(file){
			SourceImage.imageFilename = file;
			SourceImage.is_ready = false;
			SourceImage.image = new Image();  //create new image object
			SourceImage.image.src = file; //load file into image object
		}
	};
	return SourceImage;
}

function newTileSource(){ //image used to create tile 
	var TileSource = {
		canvas: 0, //main canvas object
		ctx: 0, //main canvas drawing context
		sourceImage: 0, //image source for this tile
		init: function(width, height, src_x, src_y, source){
			TileSource.sourceImage = source;  //set image source
			TileSource.canvas = document.createElement('canvas');
			TileSource.ctx = TileSource.canvas.getContext('2d'); //create main drawing canvas
			TileSource.canvas.setAttribute('width', width); //set tile source canvas size
			TileSource.canvas.setAttribute('height', height);
			TileSource.ctx.drawImage(TileSource.sourceImage.image, src_x, src_y, width, height, 0, 0, width, height); //draw image to tile source canvas
		}
	};
	return TileSource;
}

/*** function to create and then return a new Tile object */
function newTile(){
	var Tile = {
		x: 0, // X position of this tile
		y: 0, //Y position of this tile
		width: 0, //width and height of this tile
		height: 0,
		sourceIndex: 0, //index of tile source in tile engine's source array
		init: function(x, y, width, height, source){ //initialize sprite
			Tile.x = x;
			Tile.y = y;
			Tile.width = width;
			Tile.height = height;
			Tile.sourceIndex = source; // set index of tile source for this tile
		}
	};
	return Tile;  //returns newly created sprite object
};

/*** function to create and then return a new Tile object */
function newSprite(){
	var Sprite = {
		x: 0, // X position of this Sprite
		y: 0, //Y position of this Sprite
		width: 0, //width and height of this Sprite
		height: 0,
		sourceHash: 0, //index of Sprite source in tile engine's source array
		init: function(x, y, width, height, sourceHash){ //initialize sprite
			Sprite.x = x;
			Sprite.y = y;
			Sprite.width = width;
			Sprite.height = height;
			Sprite.sourceHash = sourceHash;
		}
	};
	return Sprite;  //returns newly created sprite object
};

function newZone(){
	var Zone = {
		canvas: 0, //zone canvas object
		tileEngine: 0, //the main tile engine object (used to fetch tile sources)
		ctx: 0, //zone canvas drawing context
		left: 0, //x position of this zone in the tile map
		top: 0, //y position of this zone in the tile map
		right: 0, //x position of right edge
		bottom: 0, //y position of bottom edge
		tileWidth: 0,
		tileHeight: 0,
		width: 0,
		height: 0,
		color: 0,
		x: 0,
		y: 0,
		tiles: 0, //array of tiles in this zone
		init: function(engine, left, top, tilesWide, tilesHigh, tileWidth, tileHeight, width, height){
			Zone.tileEngine = engine;
			Zone.left = Zone.x = left;
			Zone.top = Zone.y = top;
			Zone.right = left + width;
			Zone.bottom = top + height;
			Zone.tileWidth = tileWidth;
			Zone.tileHeight = tileHeight;
			Zone.width = width;
			Zone.height = height;
			Zone.canvas = document.createElement('canvas');
			Zone.ctx = Zone.canvas.getContext('2d'); //create main drawing canvas
			Zone.canvas.setAttribute('width', width); //set tile source canvas size
			Zone.canvas.setAttribute('height', height);
			Zone.tiles = new Array();
			Zone.color = "rgba(0,0,0,0)";
		},
		addTile: function(tile){
			Zone.tiles.push(tile);	
		},
		arrangeTiles: function(){
			var tiles_wide = Zone.width / Zone.tileWidth;
			var tiles_high = Zone.height / Zone.tileHeight;
			var index = 0;
			for(var i = 0; i < tiles_high; i++)
			{
				for(var j = 0; j < tiles_wide; j++)
				{
					Zone.tiles[index].x = j * Zone.tileWidth;
					Zone.tiles[index].y = i * Zone.tileHeight;
					index++;
				}
			}
		},
		drawTiles: function(viewX, viewY, viewWidth, viewHeight){
			Zone.ctx.clearRect(0,0,Zone.width, Zone.height);//clear main canvas
			if(Zone.tiles){
				var x = viewX;
				var y = viewY;
				var width = viewWidth; 
				var height = viewHeight;
				for(var i = 0, ii = Zone.tiles.length; i < ii; i++){
					var check_tile = Zone.tiles[i];
					var tilex = check_tile.x + Zone.x;
					var tiley = check_tile.y + Zone.y;
					//check to see if each tile is outside the viewport
					if((tilex >= (viewX+width) || tiley >= (viewY+height)) ||((tilex + check_tile.width) < x || (tiley + check_tile.height < y))){
						continue;//if it's outside, loop again	
					}
					else{
						if(Zone.tileEngine.tileSource[check_tile.sourceIndex]){
							Zone.ctx.drawImage(Zone.tileEngine.tileSource[check_tile.sourceIndex].canvas, check_tile.x, check_tile.y); //draw tile based on its source index and position					
						}
					}
				}
			}
			Zone.ctx.fillStyle = Zone.color;    
			Zone.ctx.fillRect(0,0,Zone.width, Zone.height);
		}
	};
	return Zone;
}
	

function newTileEngine(){
	var TileEngine = { //main canvas and demo container
		canvas: 0, //main canvas object
		ctx: 0, //main canvas drawing context
		tiles: 0, //array of tiles
		zones: 0, //array of tile zones
		sources: 0, //array of source images
		tileSource: 0, //array of tile source objects, one for each unique tile
		width: 0, //width of tile map
		height: 0,  //height of tile map
		zoneTilesWide: 0, //width in tiles of a zone
		zoneTilesHigh: 0,  //height in tiles of a zone
		tilesHigh: 0, //height in tiles of entire map
		tilesWide: 0, //width in tiles of entire map
		tileWidth: 0, //width in pixels single tile
		tileHeight: 0, //height in pixels of single tile
		sprites: 0,
		main_sprite: 0,
		sourceFiles: 0,
		sourceTileCounts: 0,
		sourceTileAccross: 0,
		tilesArray: 0,
		mouse: 0,
		windowVelocityx: 0,
		windowVelocityy: 0,
		timeofDay: 0.2,
		
		init: function(){ //initialize experiment
			TileEngine.mouse = newMouse();
			TileEngine.mouse.init(TileEngine.canvas, TileEngine)
			TileEngine.sources = new Array();
			TileEngine.loadSource();
			TileEngine.sources[0].image.onload = function(){  //event handler for image load 
				TileEngine.sources[0].is_ready = true; // image source is ready when image is loaded
				TileEngine.tileSource = new Array();
				TileEngine.createTileSource(TileEngine.sourceTileCounts, TileEngine.sourceTileAccross);	//create tile sources using image source		
			}
			TileEngine.tiles = new Array();
			TileEngine.zones = new Array();
			TileEngine.createTiles();  //create tiles - uses tilesArray declared below
			
		},
		setMapAttributes: function(obj){ //this function must be called prior to initializing tile engine
			TileEngine.canvas = obj.canvas;  //get canvas element from html
			TileEngine.ctx = obj.ctx; //create main drawing canvas
			TileEngine.width  = TileEngine.canvas.width;
			TileEngine.height = TileEngine.canvas.height;
			TileEngine.x = obj.init_x;
			TileEngine.y = obj.init_y;
			TileEngine.tileWidth = obj.tileWidth;
			TileEngine.tileHeight = obj.tileHeight;
			TileEngine.zoneTilesWide = obj.zoneTilesWide;
			TileEngine.zoneTilesHigh = obj.zoneTilesHigh;
			TileEngine.tilesWide = obj.tilesWide;
			TileEngine.tilesHigh = obj.tilesHigh;
			TileEngine.sourceFiles = obj.sourceFiles;
			TileEngine.sourceTileCounts = obj.sourceTileCounts;
			TileEngine.sourceTileAccross = obj.sourceTileAccross;
			TileEngine.tileOffsetX = obj.tileOffestX;
			TileEngine.tileOffsetY = obj.tileOffsetY;
			TileEngine.tilesArray = obj.tilesArray;
		},
		loadSource: function(){ //create and initialize image source
			var source = newSourceImage();  
			source.init(TileEngine.sourceFiles);
			TileEngine.sources.push(source);
		},
		drawFrame: function(){ //main drawing function
			TileEngine.ctx.clearRect(0,0,TileEngine.width, TileEngine.height);  //clear main canvas
			if(TileEngine.zones){
				TileEngine.updateMouse();
				//draw Base Map
				for(var i = 0, ii = TileEngine.zones.length; i < ii; i++){
					var check_zone = TileEngine.zones[i];
					//check to see if each zone is outside the viewport
					if((check_zone.x >= (TileEngine.x+TileEngine.width) || check_zone.y >= (TileEngine.y+TileEngine.height))||((check_zone.x + check_zone.width) < TileEngine.x || (check_zone.y + check_zone.height < TileEngine.y))){ //only draw zones that are in the viewport
						continue;//if it's outside, loop again	
					}
					else{
						TileEngine.zones[i].drawTiles(TileEngine.x, TileEngine.y,TileEngine.width, TileEngine.height);
						TileEngine.ctx.drawImage(TileEngine.zones[i].canvas, TileEngine.zones[i].x-TileEngine.x, TileEngine.zones[i].y-TileEngine.y);
					}
				}
				//Draw Sprites
				//TileEngine.ctx.drawImage(TileEngine.tileSource[15].canvas, 32-TileEngine.x, 32-TileEngine.y); 
				//Draw Decorations
				//Draw Weather
				TileEngine.ctx.fillStyle = "rgba(0,0,0," + TileEngine.timeofDay+ ")";    
				TileEngine.ctx.fillRect(0,0,TileEngine.width, TileEngine.height);
			}
		},
		createTileSource: function(count, accross){ //create tiles sources
			var accross_count = 0;
			var x = 0;
			var y = 0;
			for(var i = 0; i < count; i++){
				var new_tileSource = newTileSource();
				new_tileSource.init(TileEngine.tileWidth, TileEngine.tileHeight, x, y, TileEngine.sources[0]);
				TileEngine.tileSource.push(new_tileSource);
				accross_count++;
				x += TileEngine.tileWidth;
				if(accross_count >= accross){
					accross_count = 0;
					y += TileEngine.tileHeight;
					x = 0;
				}
			}
		},
		createZones: function(){//create array of zones for map
			//caluculate how many zones we need (width by height)
			var zone_wide = Math.ceil(TileEngine.tilesWide/TileEngine.zoneTilesWide);
			var zone_high = Math.ceil(TileEngine.tilesHigh/TileEngine.zoneTilesHigh);

			/*these are used if tilemap is not evenly divisible by size of zones in tiles
			**they are used to define the size of zones on the right and bottom edges of the
			**map */
			var x_remainder = TileEngine.tilesWide%TileEngine.zoneTilesWide;
			var y_remainder = TileEngine.tilesHigh%TileEngine.zoneTilesHigh;
			
			for(var h = 0; h < zone_high; h++){ //loop through zone rows
				for(var i = 0; i < zone_wide; i++) //loop through zone columns
				{
					var new_zone = newZone(); //create new zone
					var x = i * TileEngine.zoneTilesWide * TileEngine.tileWidth //set x pos of new zone
					var y = h * TileEngine.zoneTilesHigh * TileEngine.tileHeight //set y pos of new zone
					var width = TileEngine.zoneTilesWide * TileEngine.tileWidth; //set width of new zone
					var tiles_wide = TileEngine.zoneTilesWide //set tiles wide for new zone
					if(i == (zone_wide - 1) && x_remainder > 0)  //if is last zone on horizontal row and tiles divide unevenly into zones
					{
						tiles_wide = x_remainder; //change new zone tiles wide to be correct
						width = tiles_wide * TileEngine.tileWidth;  //change new zone width to be correct
					}
					var height = TileEngine.zoneTilesHigh * TileEngine.tileHeight; //set height of new zone
					var tiles_high = TileEngine.zoneTilesHigh //set tiles high for new zone
					if(h == (zone_high - 1) && y_remainder > 0) //if last zones on bottom and tiles divide unevenly into zones
					{
						tiles_high = y_remainder; //adjust tiles high
						height = tiles_high * TileEngine.tileHeight; //adjust zone height
					}
					
					new_zone.init(TileEngine, x, y, tiles_wide, TileEngine.zoneTilesHigh, TileEngine.tileWidth, TileEngine.tileHeight, width, height); //intitialize new zone
					TileEngine.zones.push(new_zone); //push zone to tile engine array
				}
			}
			
		},
		createTiles: function() { //load tile array
			TileEngine.createZones();  //create zones
			var tile_index = 0;  //track current position in tile array
			var y_zone = 0; //used to determine which zone to add tile to
			var x_zone = 0; //used to determine which zone to add tile to
			var zone_index = 0; //track current position in zone array
			var zone_wide = Math.ceil(TileEngine.tilesWide/TileEngine.zoneTilesWide); //how many zones are there horizontally
			for(var h = 0, hh = TileEngine.tilesHigh; h < hh; h++)
			{
				y_zone = Math.floor(h/TileEngine.zoneTilesHigh); //calculate which vertical zone we are in
				for(var i = 0, ii = TileEngine.tilesWide; i < ii; i++){ //cycle through each row
					
					x_zone = Math.floor(i/TileEngine.zoneTilesWide);// calculate which horizontal zone we are in
					var new_tile = newTile(); //create new tile object
					new_tile.init(0, 0, TileEngine.tileWidth, TileEngine.tileHeight, TileEngine.tilesArray[tile_index]); //init tile
					zone_index = (y_zone * zone_wide) + x_zone;//find what zone to add to using vert and horizontal positions
					TileEngine.zones[zone_index].addTile(new_tile); //add tile to zone
					tile_index++;
				}
				 x_zone = 0; //reset horizontal position when we loop to new row
			}
			
			for(var j = 0, jj = TileEngine.zones.length; j < jj; j++){
				TileEngine.zones[j].arrangeTiles(); //go throughh and arange x and y positions of tiles in zones
			}
		},
		updateMouse: function(){
			TileEngine.windowVelocityx = (TileEngine.windowVelocityx + (TileEngine.mouse.accelx / 10)) * 0.96;
			TileEngine.windowVelocityy = (TileEngine.windowVelocityy + (TileEngine.mouse.accely / 10)) * 0.96;
			TileEngine.x -= TileEngine.windowVelocityx;
			TileEngine.y -= TileEngine.windowVelocityy;
			//pull back if its off screen
			/*if(TileEngine.x < 0 && !TileEngine.mouse.isDown()) {
				TileEngine.windowVelocityx -= 0.1;
			}
			if(TileEngine.y < 0 && !TileEngine.mouse.isDown()) {
				TileEngine.windowVelocityy -= 0.1;
			}
			if((TileEngine.x+TileEngine.width) > (TileEngine.tilesWide*TileEngine.tileWidth)) {
				this._windowVelocity += 0.1;
			}
			if((TileEngine.y+TileEngine.height) > (TileEngine.tilesHigh*TileEngine.tileHeight)) {
				this._windowVelocity += 0.1;
			}*/
			
			TileEngine.mouse.reset();
		}
	}
	return TileEngine;
};


