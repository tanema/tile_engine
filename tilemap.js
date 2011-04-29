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

function newPhysicsEngine(){
	var physics_engine = {
		tiles: 0, tile_width: 0, tile_height: 0,
		init: function(TileEngine){
			physics_engine.tiles = TileEngine.tiles
			physics_engine.tile_width = TileEngine.tileWidth 
			physics_engine.tile_height = TileEngine.tileHeight
			physics_engine.map_width = TileEngine.mapWidth 
			physics_engine.map_height = TileEngine.mapHeight
		},
		position_handler: function(event, evnt_obj){
			var x = evnt_obj.sprite.x,
					y = evnt_obj.sprite.y,
					x_top, x_bottom, y_top, y_bottom;
			if(evnt_obj.dx >= 0){
				x += evnt_obj.sprite.width + evnt_obj.dx
			}else{
				x += evnt_obj.dx - physics_engine.tile_width
			}
			if(evnt_obj.dy >= 0){
				y -= evnt_obj.sprite.height + evnt_obj.dy
			}else{
				y -= evnt_obj.dy - physics_engine.tile_height
			}
			
			x	= (Math.round(x / physics_engine.tile_width) * physics_engine.tile_width+physics_engine.map_width)%physics_engine.map_width
			y	= (Math.round(y / physics_engine.tile_height) * physics_engine.tile_height+physics_engine.map_height)%physics_engine.map_height
			
			x_top 		= ((x + physics_engine.tile_width) + physics_engine.map_width) % physics_engine.map_width
			x 				= ( x + physics_engine.map_width)  % physics_engine.map_width 
			x_bottom 	= ((x - physics_engine.tile_width) + physics_engine.map_width) % physics_engine.map_width
			y_top			= ((y + physics_engine.tile_height) + physics_engine.map_height ) % physics_engine.map_height
			y					= ( y + physics_engine.map_height) % physics_engine.map_height
			y_bottom	= ((y - physics_engine.tile_height) + physics_engine.map_height ) % physics_engine.map_height
			
			physics_engine.tiles[x][y].darker = 0.5;
			physics_engine.tiles[x_top][y].darker = 0.5;
			physics_engine.tiles[x_bottom][y].darker = 0.5;
			physics_engine.tiles[x][y_top].darker = 0.5;
			physics_engine.tiles[x][y_bottom].darker = 0.5;
			
			evnt_obj.sprite.x += evnt_obj.dx;
			evnt_obj.sprite.y -= evnt_obj.dy;
			
			$("#block").html(x.toFixed(2) + "," + y.toFixed(2))
		},
		add_actor: function(container){
			$(container).bind('position_changes', physics_engine.position_handler)
		},
	}
	return physics_engine;
}

function newMouse(){
	var Mouse = {
			down: false,offsetx: 0,offsety: 0,timer: 0,accelx: 0,accely: 0,
			clickposx: 0,clickposy: 0,tileEngine:0,vel_x: 0,vel_y:0,view: 0,
			init: function(context, tileEngine) {
				Mouse.tileEngine = tileEngine;
				Mouse.view = tileEngine.view;
				$(context)
						.mousedown(function(event)  {Mouse.setClickPos(event)})
						.mouseup(function()  {Mouse.down = false;})
						.mouseout(function() {Mouse.down = false;})
						.mousemove(function(event) {Mouse.move(event);});
			},
			isDown: function() {return Mouse.down;},
			setClickPos: function(event) { 
				Mouse.tileEngine.active_controller = Mouse;
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
			},
			update: function(){
				Mouse.vel_x = (Mouse.vel_x + (this.accelx / 10)) * 0.96;
				Mouse.vel_y = (Mouse.vel_y + (this.accely / 10)) * 0.96;
				
				Mouse.view.x = Mouse.view.tileEngine.renderCircular ? (Mouse.view.x-Mouse.vel_x)%Mouse.view.tileEngine.mapWidth:(Mouse.view.x-Mouse.vel_x)
				Mouse.view.y = Mouse.view.tileEngine.renderCircular ? (Mouse.view.y-Mouse.vel_y)%Mouse.view.tileEngine.mapHeight:(Mouse.view.y-Mouse.vel_y)
				Mouse.view.viewWidth = Mouse.view.x + Mouse.view.tileEngine.width;
				Mouse.view.viewHeight = Mouse.view.y + Mouse.view.tileEngine.height;
				
				if(!Mouse.tileEngine.renderCircular){
					if(Mouse.view.x < 0 && !this.isDown())
						Mouse.vel_x -= 0.1;
					if(Mouse.view.y < 0 && !this.isDown()) 
						Mouse.vel_y -= 0.1;
					if(Mouse.view.viewWidth > Mouse.tileEngine.mapWidth && !this.isDown()) 
						Mouse.vel_x += 0.1;
					if(Mouse.view.viewHeight > Mouse.tileEngine.mapHeight && !this.isDown()) 
						Mouse.vel_y += 0.1;
				}
				
				this.reset();
			}
	};
	return Mouse;
}

function newKeyboard(){
	var keyboard = {
		orientation: {}, actor: 0,LEFT: 37,RIGHT: 39,UP: 38,DOWN: 40,
		doc_click: false, ctx_click:false, _focus: false, ctx: 0,
		thrust: .3,	decay: .97,	maxSpeed: 1, speedX: 0,speedY: 0,
		view: 0, tile_engine:0, offset_x: 0, offset_y: 0, x:0, y:0,
		width:0, height: 0,
		init: function(TileEngine, to_move) {
			keyboard.ctx = TileEngine.canvas;
			keyboard.tile_engine = TileEngine;
			keyboard.actor = to_move;
			keyboard.width = to_move.width;
			keyboard.height = to_move.height;
			keyboard.offset_x = TileEngine.width * 0.5;
			keyboard.offset_y = TileEngine.height * 0.5;
			$(keyboard.ctx).mouseup(function(event){keyboard.ctx_click = true;})
			$(document)
					.keydown(function(event){
						keyboard.orientation[event.keyCode] = true;
						keyboard.tile_engine.active_controller = keyboard;
					})
					.keyup(function(event){
						keyboard.orientation[event.keyCode] = false;
					})
					.mousedown(function(event){keyboard.doc_click = true;})
					.mouseup(function(event){
						keyboard._focus = keyboard.ctx_click && keyboard.doc_click;
						$('canvas').css("border", (keyboard._focus ? "2px solid lightblue":""))
						keyboard.x = keyboard.actor.x;
						keyboard.y = keyboard.actor.y;
						keyboard.doc_click = keyboard.ctx_click = false;
					})
		},
		update: function (){
			if(keyboard._focus){
				if (keyboard.orientation[keyboard.LEFT]){
					keyboard.speedX -= keyboard.thrust;
					keyboard.actor.left();
				}
				if (keyboard.orientation[keyboard.RIGHT]){
					keyboard.speedX += keyboard.thrust;
					keyboard.actor.right();
				}
				if (keyboard.orientation[keyboard.UP]){
					keyboard.speedY += keyboard.thrust;
					keyboard.actor.up();
				}
				if (keyboard.orientation[keyboard.DOWN]){
					keyboard.speedY -= keyboard.thrust;
					keyboard.actor.down();
				}
				keyboard.speedX *= keyboard.decay;
				keyboard.speedY *= keyboard.decay;
				var currentSpeed = Math.sqrt((keyboard.speedX * keyboard.speedX) + (keyboard.speedY * keyboard.speedY));
				if (currentSpeed > keyboard.maxSpeed){
					keyboard.speedX *= keyboard.maxSpeed/currentSpeed;
					keyboard.speedY *= keyboard.maxSpeed/currentSpeed;
				}
				
				$(keyboard.actor).trigger('position_changes', {
					sprite: keyboard,
					dx: keyboard.speedX,
					dy: keyboard.speedY
				});
				
				//this is kind of hacky but when the view changes so does the view co-ord
				if(keyboard.tile_engine.renderCircular){
					if(keyboard.tile_engine.view.x >= keyboard.tile_engine.mapWidth){
						keyboard.tile_engine.view.x = 0
						keyboard.x -= keyboard.tile_engine.mapWidth
					}
					if(keyboard.tile_engine.view.x <= -keyboard.tile_engine.mapWidth){
						keyboard.tile_engine.view.x = 0
						keyboard.x += keyboard.tile_engine.mapWidth
					}
					if(keyboard.tile_engine.view.y >= keyboard.tile_engine.mapHeight){
						keyboard.tile_engine.view.y = 0
						keyboard.y -= keyboard.tile_engine.mapHeight
					}
					if(keyboard.tile_engine.view.y <= -keyboard.tile_engine.mapHeight){
						keyboard.tile_engine.view.y = 0
						keyboard.y += keyboard.tile_engine.mapHeight
					}
				}
				
				keyboard.actor.x = (keyboard.x+keyboard.tile_engine.mapWidth)%keyboard.tile_engine.mapWidth
				keyboard.actor.y = (keyboard.y+keyboard.tile_engine.mapHeight)%keyboard.tile_engine.mapHeight
				
				keyboard.tile_engine.view.viewWidth = keyboard.tile_engine.view.x + keyboard.tile_engine.width;
				keyboard.tile_engine.view.viewHeight = keyboard.tile_engine.view.y + keyboard.tile_engine.height;
				keyboard.tile_engine.view.x += (keyboard.x - (keyboard.tile_engine.view.x + keyboard.offset_x)) * 0.02
				keyboard.tile_engine.view.y += (keyboard.y - (keyboard.tile_engine.view.y + keyboard.offset_y)) * 0.01
			}
		}
	}
	return keyboard;
}

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
		x: 0,y: 0,width: 0,height: 0,sourceHash: 0, tileEngine: 0,current_index:0, current_direction: 0,
		init: function(x, y, width, height, sourceHash, te){ //initialize sprite
			Sprite.x = x;
			Sprite.y = y;
			Sprite.width = width;
			Sprite.height = height;
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
		}
	};
	return Sprite;  //returns newly created sprite object
};

function getBytes(num) {
    return [num & 0xF, (num >> 4) & 0xFFFF, (num >> 20) & 0xFFFF];
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
		darker:0,
		init: function(x, y, width, height, source){ //initialize sprite
			Tile.x = x;
			Tile.y = y;
			Tile.width = width;
			Tile.height = height;
			var sourceNumbers = getBytes(source)
			Tile.baseSourceIndex = sourceNumbers[2]; // set index of tile source for this tile
			Tile.decorationIndex = sourceNumbers[1]; 
			Tile.physicsID = sourceNumbers[0]; 
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
						if(check_tile.darker != 0){
							Zone.ctx.fillStyle = "rgba(0,0,0," + check_tile.darker + ")";    
							Zone.ctx.fillRect(check_tile.local_x,check_tile.local_y,Zone.tileEngine.tileWidth, Zone.tileEngine.tileHeight);
							check_tile.darker = 0;
						}
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
					if(view.isInView(check_tile) && Zone.tileEngine.tileSource[check_tile.decorationIndex]){
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
		sprites: 0,
		main_sprite: 0,
		tilesArray: 0,
		mouse: newMouse(),
		keyboard: newKeyboard(),
		physics_engine: newPhysicsEngine(),
		renderCircular: false,
		timeofDay: 0.2,
		view : 0,
		active_controller: 0,
		init: function(){ //initialize experiment
			if(!TileEngine.view)
				alert("please set map attributes before initializing tile engine");
			TileEngine.mouse.init(TileEngine.canvas, TileEngine)
			TileEngine.keyboard.init(TileEngine, TileEngine.main_sprite)
			TileEngine.createTiles();  //create tiles - uses tilesArray declared below
			TileEngine.physics_engine.init(TileEngine)
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
			TileEngine.tilesArray = obj.tilesArray;
			TileEngine.renderCircular |= obj.renderCircular;
			TileEngine.mapWidth = TileEngine.tilesWide*TileEngine.tileWidth
			TileEngine.mapHeight = TileEngine.tilesHigh*TileEngine.tileHeight
			TileEngine.view = newView(TileEngine);
			TileEngine.view.init(obj.init_x,obj.init_y);
			var source = newSourceImage();  
			source.init(obj.sourceFile);
			source.image.onload = function(){  //event handler for image load 
				TileEngine.tileSource = TileEngine.createTileSource(obj.sourceTileCounts, obj.sourceTileAccross, source);	//create tile sources using image source		
			}
		},
		setMainSpriteAttributes: function(obj){ 
			TileEngine.main_sprite = newSprite();
			TileEngine.main_sprite.init(obj.init_x, obj.init_y, TileEngine.tileWidth, TileEngine.tileHeight, obj.movement_hash, TileEngine)
			TileEngine.physics_engine.add_actor(TileEngine.main_sprite);
		},
		drawFrame: function(){ //main drawing function
			TileEngine.ctx.clearRect(0,0,TileEngine.width, TileEngine.height);  //clear main canvas
			TileEngine.active_controller ? TileEngine.active_controller.update():TileEngine.view.update()
			if(TileEngine.zones){
				(TileEngine.renderCircular ? TileEngine.renderCirc(TileEngine.view): TileEngine.renderNorm(TileEngine.view));
			}
			TileEngine.ctx.fillStyle = "rgba(0,0,0," + TileEngine.timeofDay+ ")";    
			TileEngine.ctx.fillRect(0,0,TileEngine.width, TileEngine.height);
		},
		renderCirc: function(view){
			var i = TileEngine.zones.length,
					validZones = new Array(),
					views = TileEngine.getCurrentViews(view);
			while(i--){
				var check_zone = TileEngine.zones[i],v = views.length;
				while(v--){
					var currentView = views[v]
					if(currentView.isInView(check_zone)){
						validZones.push(check_zone.forDecoration(currentView));
						check_zone.drawTiles(currentView);
						TileEngine.ctx.drawImage(check_zone.canvas, (check_zone.x+currentView.xoffset)-view.x, (check_zone.y+currentView.yoffset)-view.y);
					}
				}
			}
			//main_sprite
			var v = views.length;
			while(v--){
				var currentView = views[v];
				if(currentView.isInView(TileEngine.main_sprite)){
					TileEngine.ctx.drawImage(TileEngine.tileSource[TileEngine.main_sprite.current_frame()].canvas, (TileEngine.main_sprite.x+currentView.xoffset)-view.x, (TileEngine.main_sprite.y+currentView.yoffset)-view.y);
				}
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
					TileEngine.ctx.drawImage(check_zone.canvas, check_zone.x-view.x, check_zone.y-view.y);
				} 
			}
			
			//main_sprite
			if(view.isInView(TileEngine.main_sprite))
				TileEngine.ctx.drawImage(TileEngine.tileSource[TileEngine.main_sprite.current_frame()].canvas, TileEngine.main_sprite.x-view.x, TileEngine.main_sprite.y-view.y);
			
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
		createTileSource: function(count, accross, source){ //create tiles sources
			var source_array = new Array();
			var accross_count = 0;
			var x = 0;
			var y = 0;
			for(var i = 0; i < count; i++){
				var new_tileSource = newTileSource();
				new_tileSource.init(TileEngine.tileWidth, TileEngine.tileHeight, x, y, source);
				source_array.push(new_tileSource);
				accross_count++;
				x += TileEngine.tileWidth;
				if(accross_count >= accross){
					accross_count = 0;
					y += TileEngine.tileHeight;
					x = 0;
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
			TileEngine.tiles = new Array();
			for(var j = 0, jj = TileEngine.zones.length; j < jj; j++){
				TileEngine.zones[j].arrangeTiles(TileEngine.tiles); //go throughh and arange x and y positions of tiles in zones
			}
		}
	}
	
	return TileEngine;
};


