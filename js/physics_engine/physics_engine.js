function newPhysicsEngine(){
	var p_e = {
		tiles: 0, tile_width: 0, tile_height: 0,
		bodies: new Array(), collidable_bodies: new Array(),
		ingnore_collide: false,
		init: function(tiles, tileWidth, tileHeight, mapWidth, mapHeight){
			p_e.tiles = tiles
			p_e.tile_width = tileWidth 
			p_e.tile_height = tileHeight
			p_e.map_width = mapWidth 
			p_e.map_height = mapHeight
		},
		inside_map: function(i, span){
			return (i + span) % span
		},
		to_unit: function(i, unit, span){
			return p_e.inside_map((Math.floor(i/ unit) * unit),span)
		},
		collide: function(){
			for(var i=0, l=p_e.collidable_bodies_length; i<l; i++){
				var body1 = p_e.collidable_bodies[i];
				if(body1.ingnore_collide)
						continue;
				for(var j=i+1; j<l; j++){
					var body2 = p_e.collidable_bodies[j]
					if(body2.ingnore_collide)
						continue;
					var  x = body1.x - body2.x,
							y = body1.y - body2.y,
							slength = x*x+y*y,
							length = Math.sqrt(slength),
							target = body1.width + body2.width;

					if(length < target){
						var factor = (length-target)/length;
						body1.x -= x*factor*0.5;
						body1.y -= y*factor*0.5;
						body2.x += x*factor*0.5;
						body2.y += y*factor*0.5;
					}
				}
			}
		},
		barrier_collide: function(delta){
			var i = p_e.collidable_bodies_length
			while(i--){
				var body = p_e.collidable_bodies[i];
	        
		        var tile_width = p_e.tile_width,tile_height = p_e.tile_height,
		            map_width = p_e.map_width,map_height = p_e.map_height,
		            x = p_e.to_unit(body.x, tile_width, map_width),
		            y = p_e.to_unit(body.y, tile_height, map_height);
		            
		        if((Math.round(body.dx*2)/2)!= 0){
		          	var this_y = y,
						this_x = (body.dx > 0) ? p_e.to_unit(x+body.width, tile_width, map_width) : x,
						to_y = p_e.inside_map(body.y+body.height,map_height)
		          
		          	if(this_y > to_y){
		            	do{
		              		p_e.tiles[this_x][p_e.inside_map(this_y,map_height)].darker = 0.4;
		              		if(p_e.tiles[this_x][p_e.inside_map(this_y,map_height)].physicsID != 0){
		                		body.x -= body.dx * delta * delta;
		                		return;
		              		}
		            	}while((this_y += p_e.tile_height) < map_height)
		            	to_y = 0;
		          	}
		          	do{
		            	p_e.tiles[this_x][p_e.inside_map(this_y,map_height)].darker = 0.4;
		            	if(p_e.tiles[this_x][p_e.inside_map(this_y,map_height)].physicsID != 0){
		              		body.x -= body.dx * delta * delta;
		              		return;
		            	}
		          	}while((this_y += p_e.tile_height) < to_y)
		        }
		        
		        if((Math.round(body.dy*2)/2) != 0){
		          	var this_x = x,
		              	this_y = (body.dy < 0) ? p_e.to_unit(y+body.height+1, p_e.tile_height, map_height) : y,
		              	to_x = p_e.inside_map(body.x+body.width,map_width);
		          	if(this_x > to_x){
		            	do{
		              		p_e.tiles[p_e.inside_map(this_x,map_width)][this_y].darker = 0.4;
		              		if(p_e.tiles[p_e.inside_map(this_x,map_width)][this_y].physicsID != 0){
		                		body.y += body.dy * delta * delta;
		                		return;
		              		}
		            	}while((this_x += p_e.tile_width) < map_width)
		            	this_x = 0;
		          	}
		          	do{
		            	p_e.tiles[p_e.inside_map(this_x,map_width)][this_y].darker = 0.4;
		            	if(p_e.tiles[p_e.inside_map(this_x,map_width)][this_y].physicsID != 0){
		              		body.y += body.dy * delta * delta;
		              		return;
		            	}
		          	}while((this_x += p_e.tile_width) < to_x)
		        }
			}
		},
		border_collide: function(){
			var i = p_e.collidable_bodies_length
			while(i--){
				var body = p_e.collidable_bodies[i],
					width = body.width,
					height = body.height,
					x = body.x,
					y = body.y;

				if(x < 0){
					body.x = 0;
				}
				else if(x + width > p_e.map_width){
					body.x = p_e.map_width-width;
				}
				if(y < 0){
					body.y = 0;
				}
				else if(y + height > p_e.map_height){
					body.y = p_e.map_height-height;
				}
			}
		},
		gravity: function(){
			var i = p_e.bodies_length
			while(i--){
				p_e.bodies[i].dx *= p_e.bodies[i].decay;
				p_e.bodies[i].dy *= p_e.bodies[i].decay;
			}
		},
		accelerate: function(delta){
			var i = p_e.bodies_length
			while(i--){
				p_e.bodies[i].accelerate(delta);
			}
		},
		inertia: function(delta){
			var i = p_e.bodies_length
			while(i--){
				p_e.bodies[i].inertia(delta);
			}
		},
	    update: function(){
			var i = p_e.bodies_length
			while(i--){
	        	if(p_e.bodies[i].update)
	          		p_e.bodies[i].update();
				}
			},
		integrate: function(delta){
			p_e.gravity();
			p_e.accelerate(delta);
			p_e.collide();
			p_e.barrier_collide(delta);
			p_e.border_collide();
			p_e.inertia(delta);
			p_e.update();
		},
		add_actor: function(actor, x, y, width, height, ingnore_collide){
			var body = Body(x, y, width, height);
			$.extend(actor, body);
			p_e.bodies.push(actor)
	      	if(!ingnore_collide)
	        	p_e.collidable_bodies.push(actor)
			p_e.bodies_length = p_e.bodies.length
			p_e.collidable_bodies_length = p_e.collidable_bodies.length
		}
	}
	return p_e;
}