function newPhysicsEngine(){
	var p_e = {
		tiles: 0, tile_width: 0, tile_height: 0,
		bodies: new Array(), render_circ: false,
		ingnore_collide: false,
		init: function(TileEngine){
			p_e.tiles = TileEngine.tiles
			p_e.tile_width = TileEngine.tileWidth 
			p_e.tile_height = TileEngine.tileHeight
			p_e.map_width = TileEngine.mapWidth 
			p_e.map_height = TileEngine.mapHeight
			p_e.render_circ = TileEngine.renderCircular
		},
		inside_map: function(i, span){
			return (i + span) % span
		},
		to_unit: function(i, unit, span){
			return p_e.inside_map((Math.floor(i/ unit) * unit),span)
		},
		Body: function(x, y, width, height){
			var body = {
					x: x, y: y, px: x, py: y, dx: 0, dy: 0,
					width: width, height: height,
					decay: 0.97,
					setXY: function(x,y){
						this.px = x;
						this.py = y;
						this.x = x;
						this.y = y;
					},
					accelerate: function(delta){
						var last = this.x
						this.x += this.dx * delta * delta;
						this.y -= this.dy * delta * delta;	
					},
					inertia: function(delta){
						var diffx = this.x - this.px;
						var diffy = this.y - this.py;
						this.px = this.x;
						this.py = this.y;
						this.x += diffx * this.decay;
						this.y += diffy * this.decay;
					},
					map_collide: function(delta){
						var tile_width = p_e.tile_width,tile_height = p_e.tile_height,
								map_width = p_e.map_width,map_height = p_e.map_height,
								x = p_e.to_unit(this.x, tile_width, map_width),
								y = p_e.to_unit(this.y, tile_height, map_height);
								
						if((Math.round(this.dx*2)/2)!= 0){
							var this_y = y,
									this_x = (this.dx > 0) ? p_e.to_unit(x+this.width, tile_width, map_width) : x,
									to_y = p_e.inside_map(this.y+this.height,map_height)
							
							if(this_y > to_y){
								do{
									p_e.tiles[this_x][p_e.inside_map(this_y,map_height)].darker = 0.4;
									if(p_e.tiles[this_x][p_e.inside_map(this_y,map_height)].physicsID != 0){
										this.x -= this.dx * delta * delta;
										return;
									}
								}while((this_y += p_e.tile_height) < map_height)
								to_y = 0;
							}
							do{
								p_e.tiles[this_x][p_e.inside_map(this_y,map_height)].darker = 0.4;
								if(p_e.tiles[this_x][p_e.inside_map(this_y,map_height)].physicsID != 0){
									this.x -= this.dx * delta * delta;
									return;
								}
							}while((this_y += p_e.tile_height) < to_y)
						}
						
						if((Math.round(this.dy*2)/2) != 0){
							var this_x = x
									this_y = (this.dy < 0) ? p_e.to_unit(y+this.height+1, p_e.tile_height, map_height) : y,
									to_x = p_e.inside_map(this.x+this.width,map_width)
							if(this_x > to_x){
								do{
									p_e.tiles[p_e.inside_map(this_x,map_width)][this_y].darker = 0.4;
									if(p_e.tiles[p_e.inside_map(this_x,map_width)][this_y].physicsID != 0){
										this.y += this.dy * delta * delta;
										return;
									}
								}while((this_x += p_e.tile_width) < map_width)
								this_x = 0;
							}
							do{
								p_e.tiles[p_e.inside_map(this_x,map_width)][this_y].darker = 0.4;
								if(p_e.tiles[p_e.inside_map(this_x,map_width)][this_y].physicsID != 0){
									this.y += this.dy * delta * delta;
									return;
								}
							}while((this_x += p_e.tile_width) < to_x)
						}
					}
				}
				return body;
		},
		collide: function(){
			for(var i=0, l=p_e.bodies_length; i<l; i++){
				var body1 = p_e.bodies[i];
				if(body1.ingnore_collide)
						continue;
				for(var j=i+1; j<l; j++){
					var body2 = p_e.bodies[j]
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
			var i = p_e.bodies_length
			while(i--){
				p_e.bodies[i].map_collide(delta);
			}
		},
		border_collide: function(){
			var i = p_e.bodies_length
			while(i--){
				var body = p_e.bodies[i],
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
		integrate: function(delta){
			p_e.gravity();
			p_e.accelerate(delta);
			if(!p_e.ingnore_collide)
				p_e.collide();
			p_e.barrier_collide(delta);
			if(!p_e.render_circ)
				p_e.border_collide();
			p_e.inertia(delta);
		},
		add_actor: function(actor, x, y, width, height, ingnore_collide){
			var body = new p_e.Body(x, y, width, height)
			$.extend(actor, body)
			p_e.bodies.push(actor)
			p_e.bodies_length = p_e.bodies.length
			p_e.ingnore_collide = ingnore_collide || p_e.ingnore_collide
		}
	}
	return p_e;
}