
function newZone(){
	var Zone = {
		base_canvas: 0, //zone canvas object
		dec_canvas: 0, //zone canvas object
		tileEngine: 0, //the main tile engine object (used to fetch tile sources)
		base_ctx: 0, //zone canvas drawing context
		dec_ctx: 0, //zone canvas drawing context
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
			Zone.base_canvas = document.createElement('canvas');
			Zone.base_ctx = Zone.base_canvas.getContext('2d'); //create main drawing canvas
      		Zone.dec_canvas = document.createElement('canvas');
			Zone.dec_ctx = Zone.dec_canvas.getContext('2d'); //create main drawing canvas
			Zone.base_canvas.setAttribute('width', width); //set tile source canvas size
			Zone.base_canvas.setAttribute('height', height);
      		Zone.dec_canvas.setAttribute('width', width); //set tile source canvas size
			Zone.dec_canvas.setAttribute('height', height);
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
			Zone.base_ctx.clearRect(0,0,Zone.width, Zone.height);
			if(Zone.tiles){
				var i = Zone.tiles.length;
				while(i--){
					var check_tile = Zone.tiles[i];
					if(view.isInView(check_tile) && Zone.tileEngine.tileSource[check_tile.baseSourceIndex]){
						Zone.base_ctx.drawImage(Zone.tileEngine.tileSource[check_tile.baseSourceIndex].canvas, check_tile.local_x, check_tile.local_y); //draw tile based on its source index and position
					}
					if(check_tile.darker != 0){
						Zone.base_ctx.fillStyle = "rgba(0,0,0," + check_tile.darker + ")";    
						Zone.base_ctx.fillRect(check_tile.local_x,check_tile.local_y,Zone.tileWidth, Zone.tileHeight);
						check_tile.darker = 0;
					}
				}
			}
		},
		forDecoration: function(view){
			var v = $.extend({}, Zone);
				v.viewoffset = view
			return v;
		},
		drawDecorations: function(view){
			Zone.dec_ctx.clearRect(0,0,Zone.width, Zone.height);
			if(Zone.tiles){
				var i = Zone.tiles.length;
				while(i--){
					var check_tile = Zone.tiles[i];
					//decoration cannot be at tile 0
					if(check_tile.decorationIndex != 0 && view.isInView(check_tile) && Zone.tileEngine.tileSource[check_tile.decorationIndex]){
						Zone.dec_ctx.drawImage(Zone.tileEngine.tileSource[check_tile.decorationIndex].canvas, check_tile.local_x, check_tile.local_y); //draw tile based on its source index and position
          			}
				}
			}
		}
	};
	return Zone;
}