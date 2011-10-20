
function newSprite(){
	var Sprite = {
		sourceHash: 0,current_index:0, current_direction: 0, director: null,
		init: function(x, y, width, height, sourceHash, director){ //initialize sprite
			Sprite.director = director;
			Sprite.sourceHash = sourceHash;
			Sprite.current_direction = Sprite.sourceHash.up
		},
		update: function(){
			//if(Sprite.tileEngine.renderCircular){
			//	Sprite.x = (Sprite.x+Sprite.tileEngine.mapWidth)%Sprite.tileEngine.mapWidth
			//	Sprite.y = (Sprite.y+Sprite.tileEngine.mapHeight)%Sprite.tileEngine.mapHeight
			//}
      /*var mapwidth = keyboard.tile_engine.mapWidth,
				  mapheight = keyboard.tile_engine.mapHeight;
				  
			if(keyboard.tile_engine.renderCircular){
				if(keyboard.tile_engine.view.viewWidth >= mapwidth+mapwidth){
					keyboard.tile_engine.view.x = 0;
					keyboard.setXY( keyboard.x - mapwidth, keyboard.y)
				}else if(keyboard.tile_engine.view.x <= -mapwidth){
					keyboard.tile_engine.view.x = 0;
					keyboard.setXY( keyboard.x + mapwidth, keyboard.y)
				}
				if(keyboard.tile_engine.view.viewHeight >= mapheight+mapheight){
					keyboard.tile_engine.view.y = 0;
					keyboard.setXY( keyboard.x, keyboard.y - mapheight )
				}else if(keyboard.tile_engine.view.y <= -mapheight){
					keyboard.tile_engine.view.y = 0;
					keyboard.setXY( keyboard.x, keyboard.y + mapheight )
				}
			}
			keyboard.actor.setXY( keyboard.x, keyboard.y)
			keyboard.tile_engine.view.x = keyboard.tile_engine.view.x+(keyboard.x - (keyboard.tile_engine.view.x + keyboard.offset_x)) * 0.05
			keyboard.tile_engine.view.y = keyboard.tile_engine.view.y+(keyboard.y - (keyboard.tile_engine.view.y + keyboard.offset_y)) * 0.05
			keyboard.tile_engine.view.viewWidth = keyboard.tile_engine.view.x + keyboard.tile_engine.width;
			keyboard.tile_engine.view.viewHeight = keyboard.tile_engine.view.y + keyboard.tile_engine.height;*/
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