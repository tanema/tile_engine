/*
	Lightweight Tile Engine For HTML5 Game Creation
    Copyright (C) 2010  John Graham
	Copyright (C) 2011  Tim Anema

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

function newView(TileEngine, init_x, init_y, vw, vh){
	var view = {
		tileEngine:TileEngine,x: init_x || 0,y: init_y || 0,
		viewWidth: vw || 0,	viewHeight: vh || 0,xoffset: 0,
		yoffset: 0,
		init: function(x,y){
			view.update()
		},
		update : function(){
			view.x = view.tileEngine.renderCircular ? view.x%view.tileEngine.mapWidth:view.x
			view.y = view.tileEngine.renderCircular ? view.y%view.tileEngine.mapHeight:view.y
			view.viewWidth = view.x + view.tileEngine.width;
			view.viewHeight = view.y + view.tileEngine.height;
		},
		isInView: function(check){
			return (check.x+check.width > this.x && check.x <= this.viewWidth)&&(check.y+check.height > this.y && check.y <= this.viewHeight)
		},
		up: function(){
			var v = $.extend({}, this);
			if(v.y < 0){
				v.y += TileEngine.mapHeight;
				v.viewHeight = TileEngine.mapHeight;//no need to do the extra calc for the actual width
				v.yoffset = -TileEngine.mapHeight;
			}
			return v;
		},
		down: function(){ 
			var v = $.extend({}, this);
			if(v.viewHeight > TileEngine.mapHeight){
				v.y = 0
				v.viewHeight -= TileEngine.mapHeight;
				v.yoffset = TileEngine.mapHeight;
			}
			return v;
		},
		left: function(){ 
			var v = $.extend({}, this);
			if(v.x < 0){
				v.x += TileEngine.mapWidth;
				v.viewWidth = TileEngine.mapWidth;//no need to do the extra calc for the actual width
				v.xoffset = -TileEngine.mapWidth;
			}
			return v;
		},
	  right: function(){ 
			var v = $.extend({}, this);
			if(v.viewWidth > TileEngine.mapWidth){
				v.x = 0
				v.viewWidth -= TileEngine.mapWidth;
				v.xoffset = TileEngine.mapWidth;
			}
			return v;
		}
	}
	return view;
}

function newSourceImage(){ //image used to create tile 
	var SourceImage = {
		imageFilename: 0, //filename for image
		image: 0, //dom image object
		init: function(file){
			SourceImage.imageFilename = file;
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
};

function newSprite(){
	var Sprite = {
		sourceHash: 0, tileEngine: 0,current_index:0, current_direction: 0,
		init: function(x, y, width, height, sourceHash, te){ //initialize sprite
			te.physics_engine.add_actor(Sprite, x, y, width, height);
			Sprite.sourceHash = sourceHash;
			Sprite.tileEngine = te;
			Sprite.current_direction = Sprite.sourceHash.up
		},
		update: function(){
			//kind of deprecated
			if(Sprite.tileEngine.renderCircular){
				Sprite.x = (Sprite.x+Sprite.tileEngine.mapWidth)%Sprite.tileEngine.mapWidth
				Sprite.y = (Sprite.y+Sprite.tileEngine.mapHeight)%Sprite.tileEngine.mapHeight
			}
		},
		current_frame: function(){
			return Sprite.current_direction[Sprite.current_index];
		},
		up: function(){
			Sprite.current_direction = Sprite.sourceHash.up
			Sprite.update_index()
		},
		down: function(){
			Sprite.current_direction = Sprite.sourceHash.down
			Sprite.update_index()
		},
		left: function(){
			Sprite.current_direction = Sprite.sourceHash.left
			Sprite.update_index()
		},
		right: function(){
			Sprite.current_direction = Sprite.sourceHash.right
			Sprite.update_index()
		},
		update_index: function(){
			Sprite.current_index++;
			if(Sprite.current_index >= Sprite.current_direction.length)
				Sprite.current_index = 0
		},
		draw: function(te, views){
			if(views){
				var v = views.length;
				while(v--){
					var currentView = views[v];
					if(te.spriteSource && currentView.isInView(Sprite)){
						te.ctx.drawImage(te.spriteSource[Sprite.current_frame()].canvas, (Sprite.x+currentView.xoffset)-te.view.x, (Sprite.y+currentView.yoffset)-te.view.y);
					}
				}
			}else if(te.spriteSource && te.view.isInView(Sprite))
				te.ctx.drawImage(te.spriteSource[Sprite.current_frame()].canvas, Sprite.x-te.view.x, Sprite.y-te.view.y);
			
		}
	};
	return Sprite;  //returns newly created sprite object
};

/*** function to create and then return a new Tile object */
function newTile(){
	var Tile = {
		x: 0, // X position of this tile
		y: 0, //Y position of this tile
		local_x:0,
		local_y:0,
		width: 0, //width and height of this tile
		height: 0,
		baseSourceIndex: 0, //index of tile source in tile engine's source array
		decorationIndex: 0,
		physicsID: 0,
		darker: 0,
		init: function(x, y, width, height, source_index, physics_id){ //initialize sprite
			Tile.x = x;
			Tile.y = y;
			Tile.width = width;
			Tile.height = height;
			var sourceNumbers = getBytes(source_index)
			Tile.baseSourceIndex = sourceNumbers[1]; // set index of tile source for this tile
			Tile.decorationIndex = sourceNumbers[0]; 
			Tile.physicsID = physics_id || 0; 
		}
	};
	return Tile;  //returns newly created sprite object
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
		x: 0,
		y: 0,
		viewoffset: 0,
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
		},
		addTile: function(tile){
			Zone.tiles.push(tile);	
		},
		arrangeTiles: function(tiles_a){
			var tiles_wide = Zone.width / Zone.tileWidth,
					tiles_high = Zone.height / Zone.tileHeight,
					index = 0;
			for(var i = 0; i < tiles_high; i++){
				for(var j = 0; j < tiles_wide; j++){
					var temp_x = j * Zone.tileWidth + Zone.x,
							temp_y = i * Zone.tileHeight + Zone.y;
					Zone.tiles[index].x = temp_x
					Zone.tiles[index].y = temp_y
					Zone.tiles[index].local_x = j * Zone.tileWidth;
					Zone.tiles[index].local_y = i * Zone.tileHeight;
					if(!tiles_a[temp_x])
						tiles_a[temp_x] = new Array()
					tiles_a[temp_x][temp_y] = Zone.tiles[index]
					index++;
				}
			}
		},
		drawTiles: function(view){
			Zone.ctx.clearRect(0,0,Zone.width, Zone.height);
			if(Zone.tiles){
				var i = Zone.tiles.length;
				while(i--){
					var check_tile = Zone.tiles[i];
					if(view.isInView(check_tile) && Zone.tileEngine.tileSource[check_tile.baseSourceIndex]){
						Zone.ctx.drawImage(Zone.tileEngine.tileSource[check_tile.baseSourceIndex].canvas, check_tile.local_x, check_tile.local_y); //draw tile based on its source index and position
					}
					if(check_tile.darker != 0){
						Zone.ctx.fillStyle = "rgba(0,0,0," + check_tile.darker + ")";    
						Zone.ctx.fillRect(check_tile.local_x,check_tile.local_y,Zone.tileEngine.tileWidth, Zone.tileEngine.tileHeight);
						check_tile.darker = 0;
					}
				}
			}
		},
		forDecoration: function(view){
			var v = $.extend({}, this);
				v.viewoffset = view
			return v;
		},
		drawDecorations: function(view){
			Zone.ctx.clearRect(0,0,Zone.width, Zone.height);
			if(Zone.tiles){
				var i = Zone.tiles.length;
				while(i--){
					var check_tile = Zone.tiles[i];
					//decoration cannot be at tile 0
					if(check_tile.decorationIndex != 0 && view.isInView(check_tile) && Zone.tileEngine.tileSource[check_tile.decorationIndex]){
						Zone.ctx.drawImage(Zone.tileEngine.tileSource[check_tile.decorationIndex].canvas, check_tile.local_x, check_tile.local_y); //draw tile based on its source index and position
          }
				}
			}
		}
	};
	return Zone;
}

function newTileEngine(){
	var TileEngine = { //main canvas and demo container
		canvas: 0, //main canvas object
		ctx: 0, //main canvas drawing context
		tiles: 0, //double dimenal array by coordinates
		zones: 0, //array of tile zones
		tileSource: 0, //array of tile source objects, one for each unique tile
		width: 0, //width of tile map
		height: 0,  //height of tile map
		zoneTilesWide: 0, //width in tiles of a zone
		zoneTilesHigh: 0,  //height in tiles of a zone
		tilesHigh: 0, //height in tiles of entire map
		tilesWide: 0, //width in tiles of entire map
		tileWidth: 0, //width in pixels single tile
		tileHeight: 0, //height in pixels of single tile
		mapWidth: 0,
		mapHeight: 0,
		sprites: new Array(),
		main_sprite: 0,
		spriteSource: 0,
		mouse: newMouse(),
		keyboard: newKeyboard(),
		physics_engine: newPhysicsEngine(),
		renderCircular: false,
		timeofDay: 0.2,
		view : 0,
		active_controller: 0,
		t: 0.0,
		dt: 0.01,
		currentTime: (new Date).getTime(),
		accumulator: 0.0,
    gameTimer: 0, //holds id of main game timer
    fps: 250,
    fps_count: 0, //hold frame count
    fps_timer: 0, //timer for FPS update (2 sec)
		initialized: false,
		init: function(){ //initialize experiment
      if(!TileEngine.view)
				alert("please set map attributes before initializing tile engine");
			TileEngine.mouse.init(TileEngine.canvas, TileEngine)
			TileEngine.keyboard.init(TileEngine, TileEngine.main_sprite)
			TileEngine.physics_engine.init(TileEngine)
			TileEngine.initialized = true;
			Console.log("Tile Map Initialized");
		},
		setMapAttributes: function(obj){ //this function must be called prior to initializing tile engine
			TileEngine.canvas = obj.canvas;  //get canvas element from html
			TileEngine.ctx = obj.ctx; //create main drawing canvas
			TileEngine.width  = TileEngine.canvas.width;
			TileEngine.height = TileEngine.canvas.height;
			TileEngine.tileWidth = obj.tileWidth;
			TileEngine.tileHeight = obj.tileHeight;
			TileEngine.zoneTilesWide = obj.zoneTilesWide;
			TileEngine.zoneTilesHigh = obj.zoneTilesHigh;
			TileEngine.tilesWide = obj.tilesWide;
			TileEngine.tilesHigh = obj.tilesHigh;
			TileEngine.renderCircular |= obj.renderCircular;
			TileEngine.mapWidth = TileEngine.tilesWide*TileEngine.tileWidth
			TileEngine.mapHeight = TileEngine.tilesHigh*TileEngine.tileHeight
			TileEngine.view = newView(TileEngine);
			TileEngine.view.init(obj.init_x,obj.init_y);
			
			Console.log(obj.sourceTileCounts + ' Source Tiles to Load');
			Console.log(obj.tilesArray.length + ' Map Tiles to Load');
			
			var source = newSourceImage();  
			source.init(obj.sourceFile);
			source.image.onload = function(){  //event handler for image load 
				TileEngine.tileSource = TileEngine.createTileSource(obj.tileWidth, obj.tileHeight, obj.sourceTileCounts, obj.sourceTileAccross, obj.tile_offset_x || 0, obj.tile_offset_y || 0, source);	//create tile sources using image source		
			}
			TileEngine.createTiles(obj.tilesArray, obj.physicsArray);
		},
		setMainSpriteAttributes: function(obj){ 
			TileEngine.main_sprite = newSprite();
			TileEngine.main_sprite.init(obj.init_x, obj.init_y, obj.width, obj.height, obj.movement_hash, TileEngine)
			var source = newSourceImage();  
			source.init(obj.sourceFile);
			source.image.onload = function(){  //event handler for image load 
				TileEngine.spriteSource = TileEngine.createTileSource(obj.width, obj.height, obj.sourceTileCounts, obj.sourceTileAccross, obj.tile_offset_x || 0, obj.tile_offset_y || 0, source);	//create tile sources using image source		
			}
			TileEngine.sprites.push(TileEngine.main_sprite)
		},
		integrator: function(t,dt){
			TileEngine.active_controller ? TileEngine.active_controller.accellerate():null;
		
			var newTime = (new Date).getTime(),
				deltaTime = (newTime - TileEngine.currentTime)/100
			if(deltaTime > 0.25)
				deltaTime = 0.25
			TileEngine.currentTime = newTime;
			TileEngine.accumulator += deltaTime;
			while(TileEngine.accumulator >= TileEngine.dt) {
				TileEngine.accumulator -= TileEngine.dt;
				TileEngine.physics_engine.integrate(TileEngine.dt)
				TileEngine.t += TileEngine.dt;
			}
			TileEngine.active_controller ? TileEngine.active_controller.update():TileEngine.view.update();
		},
    start: function(){
      console.log("FPS limit set to: " + TileEngine.fps)
      var interval = 1000 / TileEngine.fps;
      TileEngine.gameTimer = setInterval(TileEngine.runLoop, interval);
      TileEngine.fps_timer = setInterval(TileEngine.updateFPS, 2000);
    },
    runLoop: function(){ //code to run on each game loop
      TileEngine.drawFrame();
      TileEngine.fps_count++;  //increments frame for fps display
    },
    updateFPS: function(){
      TileEngine.fps = TileEngine.fps_count / 2; // every two seconds cut the fps by 2
      TileEngine.fps_count = 0; // every two seconds cut the fps by 2
    },
		drawFrame: function(){ //main drawing function
			if(!TileEngine.initialized)//still loading
				return
			
			//physics
			TileEngine.integrator();
			
			//clear main canvas
			TileEngine.ctx.clearRect(0,0,TileEngine.width, TileEngine.height);  
      
			//draw()
      if(TileEngine.zones)
				(TileEngine.renderCircular ? TileEngine.renderCirc(TileEngine.view): TileEngine.renderNorm(TileEngine.view));
			
      //do brightness of the screen
			TileEngine.ctx.fillStyle = "rgba(0,0,0," + TileEngine.timeofDay+ ")";    
			TileEngine.ctx.fillRect(0,0,TileEngine.width, TileEngine.height);
		},
		renderCirc: function(view){
			var i = TileEngine.zones.length,
					validZones = new Array(),
					views = TileEngine.getCurrentViews(view);
			//main map
			while(i--){
				var check_zone = TileEngine.zones[i],v = views.length;
				while(v--){
					var currentView = views[v]
					if(currentView.isInView(check_zone)){
						validZones.push(check_zone.forDecoration(currentView));
						check_zone.drawTiles(currentView);
						TileEngine.ctx.drawImage(check_zone.canvas, Math.round((check_zone.x+currentView.xoffset)-view.x), Math.round((check_zone.y+currentView.yoffset)-view.y));
					}
				}
			}
			
			//sprites
			i = TileEngine.sprites.length
			while(i--){
				TileEngine.sprites[i].draw(TileEngine, views)
			}
			
			//decorations
			i = validZones.length;
			while(i--){
				var check_zone = validZones[i],
					currentView = check_zone.viewoffset;
				check_zone.drawDecorations(currentView);
				TileEngine.ctx.drawImage(check_zone.canvas, (check_zone.x+currentView.xoffset)-view.x, (check_zone.y+currentView.yoffset)-view.y);
			}
		},
		renderNorm: function(view){
			var i = TileEngine.zones.length,
					validZones = new Array();
			//base map
			while(i--){
				var check_zone = TileEngine.zones[i];
				if(view.isInView(check_zone)){
					validZones.push(check_zone.forDecoration(view));
					check_zone.drawTiles(view);
					TileEngine.ctx.drawImage(check_zone.canvas, Math.round(check_zone.x-view.x), Math.round(check_zone.y-view.y));
				} 
			}
			
			//sprites
			i = TileEngine.sprites.length
			while(i--){
				TileEngine.sprites[i].draw(TileEngine)
			}
			
			//decorations
			i = validZones.length;
			while(i--){
				var check_zone = validZones[i];
				check_zone.drawDecorations(view);
				TileEngine.ctx.drawImage(check_zone.canvas, check_zone.x-view.x, check_zone.y-view.y);
			}
		},
		getCurrentViews: function(view){
			var views = [view],
					up = view.y < 0,
					down = view.viewHeight > TileEngine.mapHeight
			if(view.x < 0){
				var v = view.left();
				views.push(v);
				if(up)views.push(v.up());
				if(down)views.push(v.down());
			}
			if(view.viewWidth > TileEngine.mapWidth){
				var v = view.right();
				views.push(v);
				if(up)views.push(v.up());
				if(down)views.push(v.down());
			}
			if(up)views.push(view.up());
			if(down)views.push(view.down());
			return views;
		},
		createTileSource: function(tileWidth, tileHeight, count, accross, offset_x, offset_y, source){ //create tiles sources
			var source_array = new Array(),
					accross_count = 0,x = 0,y = 0,
					offset_x_count = 0, offset_y_count = 0;
			
			for(var i = 0; i < count; i++){
				var new_tileSource = newTileSource();
				new_tileSource.init(tileWidth, tileHeight,x+(offset_x*offset_x_count), y+(offset_y*offset_y_count), source);
				source_array.push(new_tileSource);
				accross_count++;
				x += tileWidth;
				offset_x_count++;
				if(accross_count >= accross){
					accross_count = 0;
					y += tileHeight;
					offset_y_count++;
					x = 0;
					offset_x_count = 0;
				}
			}
			return source_array;
		},
		createZones: function(){//create array of zones for map
			TileEngine.zones = new Array();
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
		createTiles: function(tilesArray, physicsArray) { //load tile array
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
					new_tile.init(0, 0, TileEngine.tileWidth, TileEngine.tileHeight, tilesArray[tile_index], physicsArray[tile_index]); //init tile
					zone_index = (y_zone * zone_wide) + x_zone;//find what zone to add to using vert and horizontal positions
					TileEngine.zones[zone_index].addTile(new_tile); //add tile to zone
					tile_index++;
				}
				 x_zone = 0; //reset horizontal position when we loop to new row
			}
			TileEngine.tiles = new Array();
			for(var j = 0, jj = TileEngine.zones.length; j < jj; j++){
				TileEngine.zones[j].arrangeTiles(TileEngine.tiles); //go throughh and arange x and y positions of tiles in zones
			}
			Console.log("Tiles Ready");
		}
	}
	
  Console.init();
  if(canvas_support.check_canvas()){  //check canvas support before intializing
    return TileEngine;
  }
  else {
    return false;
    Console.log('Your Browser Does not support this app!');	
  }
	
};


