
function newSprite(mapWidth, mapHeight, renderCircular, ctx){
	var Sprite = {
		sourceHash: 0,current_index:0, current_direction: 0, director: null,
		init: function(x, y, width, height, sourceHash, director){ //initialize sprite
			Sprite.director = director;
			Sprite.sourceHash = sourceHash;
			Sprite.current_direction = Sprite.sourceHash.up
      setInterval(Sprite.update_index, 100)
		},
		update: function(){
      if(renderCircular){
				Sprite.x = Sprite.x%mapWidth
				Sprite.y = Sprite.y%mapHeight
			}
      if(Sprite.dx > 1)
        Sprite.current_direction = Sprite.sourceHash.right
      if(Sprite.dx < -1)
        Sprite.current_direction = Sprite.sourceHash.left
      if(Sprite.dy > 1)
        Sprite.current_direction = Sprite.sourceHash.up
      if(Sprite.dy < -1)
        Sprite.current_direction = Sprite.sourceHash.down
		},
		current_frame: function(){
			return Sprite.current_direction[Sprite.current_index];
		},
		update_index: function(){
			if(Sprite.dx > 1 || Sprite.dx < -1 || Sprite.dy > 1 || Sprite.dy < -1){
        Sprite.current_index++;
        if(Sprite.current_index >= Sprite.current_direction.length)
          Sprite.current_index = 0
      }
		},
		draw: function(view, views){
			if(views){
				var v = views.length;
				while(v--){
					var currentView = views[v];
					if(Sprite.spriteSource && currentView.isInView(Sprite)){
						ctx.drawImage(Sprite.spriteSource[Sprite.current_frame()].canvas, (Sprite.x+currentView.xoffset)-view.x, (Sprite.y+currentView.yoffset)-view.y);
					}
				}
			}else if(Sprite.spriteSource && view.isInView(Sprite))
				ctx.drawImage(Sprite.spriteSource[Sprite.current_frame()].canvas, Sprite.x-view.x, Sprite.y-view.y);
			
		}
	};
	return Sprite;  //returns newly created sprite object
};