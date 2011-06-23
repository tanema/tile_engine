function newPhysicsEngine(){
	var p_e = {
		tiles: 0, tile_width: 0, tile_height: 0,
		bodies: new Array(), 
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
					map_collide: function(){
						var tile_width = p_e.tile_width,tile_height = p_e.tile_height,
								map_width = p_e.map_width,map_height = p_e.map_height,
								x = p_e.to_unit(body.x, body.dx, tile_width, map_width),
								y = p_e.to_unit(body.y, body.dy, tile_height, map_height);
								
						if((Math.round(body.dx*2)/2)!= 0){
							var this_y = y,
									this_x = (body.dx > 0) ? p_e.to_unit(x+body.width, 0, tile_width, map_width) : x,
									to_y = p_e.inside_map(body.y+body.height,map_height)
							
							if(this_y > to_y){
								do{
									if(p_e.tiles[this_x][p_e.inside_map(this_y,map_height)].physicsID != 0){
										body.dx = 0;
										return;
									}
								}while((this_y += p_e.tile_height) < map_height)
								to_y = 0;
							}
							do{
								if(p_e.tiles[this_x][p_e.inside_map(this_y,map_height)].physicsID != 0){
									body.dy = 0
									return;
								}
							}while((this_y += p_e.tile_height) < to_y)
						}
						
						if((Math.round(body.dy*2)/2) != 0){
							var this_x = x
									this_y = (body.dy < 0) ? p_e.to_unit(y+body.height+1, 0, p_e.tile_height, map_height) : y,
									to_x = p_e.inside_map(body.x+body.width,map_width)
							if(this_x > to_x){
								do{
									if(p_e.tiles[p_e.inside_map(this_x,map_width)][this_y].physicsID != 0){
										body.dy = 0
										return;
									}
								}while((this_x += p_e.tile_width) < map_width)
								this_x = 0;
							}
							do{
								if(p_e.tiles[p_e.inside_map(this_x,map_width)][this_y].physicsID != 0){
									body.dy = 0
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
				for(var j=i+1; j<l; j++){
					var body2 = p_e.bodies[j],
							x = body1.x - body2.x,
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
		barrier_collide: function(event, body){
			var i = p_e.bodies_length
			while(i--){
				p_e.bodies[i].map_collide();
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

				if(x-width < 0){
					body.x = width;
				}
				else if(x + width > p_e.map_width){
					body.x = p_e.map_width-width;
				}
				if(y-height < 0){
					body.y = height;
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
			$("#pos").html(p_e.bodies[1].x.toFixed(2) +":"+p_e.bodies[1].y.toFixed(2)+":"+p_e.bodies[1].dx.toFixed(2) +":"+p_e.bodies[1].dy.toFixed(2))
			//p_e.collide();
			//p_e.barrier_collide();
			//p_e.border_collide();
			p_e.inertia(delta);
		},
		add_actor: function(actor, x, y, width, height){
			var body = new p_e.Body(x, y, width, height)
			$.extend(actor, body)
			p_e.bodies.push(actor)
			p_e.bodies_length = p_e.bodies.length
		}
	}
	return p_e;
}