
function newView(x, y, width, height, mapWidth, mapHeight, renderCircular){
	var view = {
		x:x || 0,y:y || 0,viewWidth: 0,	viewHeight: 0,
    director: null, xoffset: 0, yoffset: 0, isControllingSprite: 0,
    main_sprite: 0,
		init: function(dir, main_sprite, isControllingSprite){
      view.director = dir;
      view.main_sprite = main_sprite;
      view.isControllingSprite = isControllingSprite;
      view.decay = 0.97; //override decay
      view.update();
		},
		update : function(){
      if(view.isControllingSprite()){
        view.x = view.x+(view.main_sprite.x - (view.x + width/2)) * 0.05
        view.y = view.y+(view.main_sprite.y - (view.y + height/2)) * 0.05
        if(renderCircular){
          if((view.x + width) >= mapWidth+mapWidth){
            view.x = 0;
            view.main_sprite.setXY( view.main_sprite.x - mapWidth, view.main_sprite.y)
          }else if(view.x <= -mapWidth){
            view.x = 0;
            view.main_sprite.setXY( view.main_sprite.x + mapWidth, view.main_sprite.y)
          }
          if((view.y + height) > mapHeight+mapHeight){
            view.y = 0;
            view.main_sprite.setXY( view.main_sprite.x, view.main_sprite.y - mapHeight )
          }else if(view.y < -mapHeight){
            view.y = 0;
            view.main_sprite.setXY( view.main_sprite.x, view.main_sprite.y + mapHeight )
          }
          
        }
      }else{ // mouse control
        if(renderCircular){
          if(view.x > mapWidth){
            view.x = view.x-mapWidth;
            view.px = view.px-mapWidth;
          }else if(view.x < -mapWidth){
            view.x = view.x+mapWidth
            view.px = view.px+mapWidth
          }
          
          if(view.y > mapHeight){
            view.y = view.y-mapHeight
            view.py = view.py-mapHeight
          }else if(view.y < -mapHeight){
            view.y = view.y+mapHeight
            view.py = view.py+mapHeight
          }
        }
      }
      view.viewWidth = view.x + width;
      view.viewHeight = view.y + height;
		},
		isInView: function(check){
			return (check.x+check.width > this.x && check.x <= this.viewWidth)&&(check.y+check.height > this.y && check.y <= this.viewHeight)
		},
		up: function(){
			var v = $.extend({}, this);
			if(v.y < 0){
				v.y += mapHeight;
				v.viewHeight = mapHeight;//no need to do the extra calc for the actual width
				v.yoffset = -mapHeight;
			}
			return v;
		},
		down: function(){ 
			var v = $.extend({}, this);
			if(v.viewHeight > mapHeight){
				v.y = 0
				v.viewHeight -= mapHeight;
				v.yoffset = mapHeight;
			}
			return v;
		},
		left: function(){ 
			var v = $.extend({}, this);
			if(v.x < 0){
				v.x += mapWidth;
				v.viewWidth = mapWidth;//no need to do the extra calc for the actual width
				v.xoffset = -mapWidth;
			}
			return v;
		},
	  right: function(){ 
			var v = $.extend({}, this);
			if(v.viewWidth > mapWidth){
				v.x = 0
				v.viewWidth -= mapWidth;
				v.xoffset = mapWidth;
			}
			return v;
		}
	}
	return view;
}