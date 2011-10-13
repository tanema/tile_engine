
function newSprite(){
	var Sprite = {
		sourceHash: 0, tileEngine: 0,current_index:0, current_direction: 0,
		init: function(x, y, width, height, sourceHash, te){ //initialize sprite
			te.physics_engine.add_actor(Sprite, x, y, width, height, true);
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