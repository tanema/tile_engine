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

function newTileEngine(){
	var TileEngine = { //main canvas and demo container
		canvas: 0, //main canvas object
		ctx: 0, //main canvas drawing context
		tiles: 0, //double dimenal array by coordinates
		zones: 0, //array of tile zones
		tileSource: 0, //array of tile source objects, one for each unique tile
		tileSourcesHash: {},
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
		mouse: newMouse(),
		keyboard: newKeyboard(),
		physics_engine: newPhysicsEngine(),
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
			TileEngine.mouse.init(TileEngine.canvas)
			TileEngine.keyboard.init(TileEngine.canvas)
			TileEngine.physics_engine.init(TileEngine.tiles, TileEngine.tileWidth, TileEngine.tileHeight,TileEngine.mapWidth, TileEngine.mapHeight)
      		TileEngine.view.init(TileEngine.mouse, TileEngine.main_sprite, TileEngine.isKeyBoardActive);
			
	        //Active controller handling
	        $(TileEngine.canvas).mouseup(function(event){TileEngine.ctx_click = true;})
			$(document).keydown(function(event){if(TileEngine._focus)TileEngine.active_controller = TileEngine.keyboard})
		                .mousedown(function(event){TileEngine.active_controller = TileEngine.mouse;TileEngine.doc_click = true;})
		                .mouseup(function(event){TileEngine._focus = TileEngine.ctx_click && TileEngine.doc_click;TileEngine.doc_click = TileEngine.ctx_click = false;})
      
      		TileEngine.initialized = true;
			Console.log("Tile Map Initialized");
		},
    	isKeyBoardActive: function(){return TileEngine.active_controller == TileEngine.keyboard},
    	isMouseActive: function(){return TileEngine.active_controller == TileEngine.mouse},
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
			TileEngine.mapWidth = TileEngine.tilesWide*TileEngine.tileWidth
			TileEngine.mapHeight = TileEngine.tilesHigh*TileEngine.tileHeight
			TileEngine.view = newView(obj.init_x,obj.init_y, TileEngine.width, TileEngine.height, TileEngine.mapWidth,TileEngine.mapHeight);
      		TileEngine.physics_engine.add_actor(TileEngine.view, obj.init_x, obj.init_y, TileEngine.width, TileEngine.height, true);
			
			Console.log(obj.sourceTileCounts + ' Source Tiles to Load');
			Console.log(obj.tilesArray.length + ' Map Tiles to Load');
			
			var source = newSourceImage();  
			source.init(obj.sourceFile);
			source.image.onload = function(){  //event handler for image load 
				TileEngine.tileSource = TileEngine.createTileSource(obj.tileWidth, obj.tileHeight, obj.sourceTileCounts, obj.sourceTileAccross, obj.tile_offset_x || 0, obj.tile_offset_y || 0, source);	//create tile sources using image source		
			}
			TileEngine.createTiles(obj.tilesArray, obj.physicsArray);
		},
		setMainSpriteAttributes: function(obj){TileEngine.main_sprite = TileEngine.addSprite(obj, TileEngine.keyboard)},
    	addSprite: function(obj, director){
      		var sprite = newSprite(TileEngine.mapWidth,TileEngine.mapHeight, TileEngine.ctx);
      		sprite.init(obj.init_x, obj.init_y, obj.width, obj.height, obj.movement_hash, director)
			TileEngine.physics_engine.add_actor(sprite, obj.init_x, obj.init_y, obj.width, obj.height);
      		var source = newSourceImage();  
			source.init(obj.sourceFile);
			source.image.onload = function(){  //event handler for image load 
				sprite.spriteSource = TileEngine.createTileSource(obj.width, obj.height, obj.sourceTileCounts, obj.sourceTileAccross, obj.tile_offset_x || 0, obj.tile_offset_y || 0, source);	//create tile sources using image source		
			}
      		TileEngine.sprites.push(sprite)
      		return sprite;
    	},
		integrator: function(t,dt){		
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
      		Console.log("FPS limit set to: " + TileEngine.fps)
      		var interval = 1000 / TileEngine.fps;
      		TileEngine.gameTimer = setInterval(TileEngine.drawFrame, interval);
      		TileEngine.fps_timer = setInterval(TileEngine.updateFPS, 2000);
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
				TileEngine.render(TileEngine.view);
			
      		//do brightness of the screen
			TileEngine.ctx.fillStyle = "rgba(0,0,0," + TileEngine.timeofDay+ ")";    
			TileEngine.ctx.fillRect(0,0,TileEngine.width, TileEngine.height);
      
      		TileEngine.fps_count++;  //increments frame for fps display
		},
		render: function(view){
			var i = TileEngine.zones.length,
					validZones = new Array();
			//base map
			while(i--){
				var check_zone = TileEngine.zones[i];
				if(view.isInView(check_zone)){
					validZones.push(check_zone.forDecoration(view));
					check_zone.drawTiles(view);
					TileEngine.ctx.drawImage(check_zone.base_canvas, Math.round(check_zone.x-view.x), Math.round(check_zone.y-view.y));
				} 
			}
			
			//sprites
			i = TileEngine.sprites.length
			while(i--){
				TileEngine.sprites[i].draw(view)
			}
			
			//decorations
			i = validZones.length;
			while(i--){
				var check_zone = validZones[i];
				check_zone.drawDecorations(view);
				TileEngine.ctx.drawImage(check_zone.dec_canvas, check_zone.x-view.x, check_zone.y-view.y);
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
			if(TileEngine.tileSourcesHash[source.imageFilename])
				return TileEngine.tileSourcesHash[source.imageFilename]


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
					x = 0;
					offset_y_count++;
					offset_x_count = 0;
				}
			}
			//save in the hash that way two file are not needed 
			TileEngine.tileSourcesHash[source.imageFilename] = source_array;
			return TileEngine.tileSourcesHash[source.imageFilename];
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
					if(i == (zone_wide - 1) && x_remainder > 0){  //if is last zone on horizontal row and tiles divide unevenly into zones
						tiles_wide = x_remainder; //change new zone tiles wide to be correct
						width = tiles_wide * TileEngine.tileWidth;  //change new zone width to be correct
					}

					var height = TileEngine.zoneTilesHigh * TileEngine.tileHeight; //set height of new zone
					var tiles_high = TileEngine.zoneTilesHigh //set tiles high for new zone
					if(h == (zone_high - 1) && y_remainder > 0){ //if last zones on bottom and tiles divide unevenly into zones
						tiles_high = y_remainder; //adjust tiles high
						height = tiles_high * TileEngine.tileHeight; //adjust zone height
					}
					
					new_zone.init(TileEngine, x, y, TileEngine.tileWidth, TileEngine.tileHeight, width, height); //intitialize new zone
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
  	if(CanvasSupport.check_canvas()){  //check canvas support before intializing
    	return TileEngine;
  	}
  	else {
    	Console.log('Your Browser Does not support this app!');	
    	return false;
  	}
};


