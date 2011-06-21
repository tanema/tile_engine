function newPhysicsEngine(){
	var p_e = {
		tiles: 0, tile_width: 0, tile_height: 0,
		init: function(TileEngine){
			p_e.tiles = TileEngine.tiles
			p_e.tile_width = TileEngine.tileWidth 
			p_e.tile_height = TileEngine.tileHeight
			p_e.map_width = TileEngine.mapWidth 
			p_e.map_height = TileEngine.mapHeight
		},
		inside_map: function(i, span){
			return (i + span) % span
		},
		to_unit: function(i, d, unit, span){
			i = Math.floor((i+d) / unit)
			return p_e.inside_map((i * unit),span)
		},
		position_handler: function(event, evnt_obj){
			var tile_width = p_e.tile_width,tile_height = p_e.tile_height,
					map_width = p_e.map_width,map_height = p_e.map_height,
					x = p_e.to_unit(evnt_obj.sprite.x, evnt_obj.dx, tile_width, map_width),
					y = p_e.to_unit(evnt_obj.sprite.y, evnt_obj.dy, tile_height, map_height);
					
			if((Math.round(evnt_obj.dx*2)/2)!= 0){
				var this_y = y,
						this_x = (evnt_obj.dx > 0) ? p_e.to_unit(x+evnt_obj.sprite.width, 0, tile_width, map_width) : x,
						to_y = p_e.inside_map(evnt_obj.sprite.y+evnt_obj.sprite.height,map_height)
				
				if(this_y > to_y){
					do{
						if(p_e.tiles[this_x][p_e.inside_map(this_y,map_height)].physicsID != 0)
							return;
					}while((this_y += p_e.tile_height) < map_height)
					to_y = 0;
				}
				do{
					if(p_e.tiles[this_x][p_e.inside_map(this_y,map_height)].physicsID != 0)
						return;
				}while((this_y += p_e.tile_height) < to_y)
			}
			
			if((Math.round(evnt_obj.dy*2)/2) != 0){
				var this_x = x
						this_y = (evnt_obj.dy < 0) ? p_e.to_unit(y+evnt_obj.sprite.height+1, 0, p_e.tile_height, map_height) : y,
						to_x = p_e.inside_map(evnt_obj.sprite.x+evnt_obj.sprite.width,map_width)
				if(this_x > to_x){
					do{
						if(p_e.tiles[p_e.inside_map(this_x,map_width)][this_y].physicsID != 0)
							return;
					}while((this_x += p_e.tile_width) < map_width)
					this_x = 0;
				}
				do{
					if(p_e.tiles[p_e.inside_map(this_x,map_width)][this_y].physicsID != 0)
						return;
				}while((this_x += p_e.tile_width) < to_x)
			}
			evnt_obj.sprite.x += evnt_obj.dx;
			evnt_obj.sprite.y -= evnt_obj.dy;
		},
		add_actor: function(container){
			$(container).bind('position_changes', p_e.position_handler)
		}
	}
	return p_e;
}