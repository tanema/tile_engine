
function newSprite(mapWidth, mapHeight, renderCircular){
	var Sprite = {
		sourceHash: 0,current_index:0, current_direction: 0, director: null,
		init: function(x, y, width, height, sourceHash, director){ //initialize sprite
			Sprite.director = director;
			Sprite.sourceHash = sourceHash;
			Sprite.current_direction = Sprite.sourceHash.up
		},
		update: function(){
      if(renderCircular){
				Sprite.x = (Sprite.x+mapWidth)%mapWidth
				Sprite.y = (Sprite.y+mapHeight)%mapHeight
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