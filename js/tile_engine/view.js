
function newView(width, height, mapWidth, mapHeight, renderCircular){
	var view = {
		x:0,y:0,viewWidth: 0,	viewHeight: 0,xoffset: 0,director: null,yoffset: 0,
		init: function(dir,x,y){
			view.x = x || 0;
			view.y = y || 0;
      view.director = dir
      view.update()
		},
		update : function(){
      /*
      if(renderCircular){
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
			
			keyboard.tile_engine.view.x = keyboard.tile_engine.view.x+(keyboard.x - (keyboard.tile_engine.view.x + keyboard.offset_x)) * 0.05
			keyboard.tile_engine.view.y = keyboard.tile_engine.view.y+(keyboard.y - (keyboard.tile_engine.view.y + keyboard.offset_y)) * 0.05
			keyboard.tile_engine.view.viewWidth = keyboard.tile_engine.view.x + keyboard.tile_engine.width;
			keyboard.tile_engine.view.viewHeight = keyboard.tile_engine.view.y + keyboard.tile_engine.height;
      Sprite.setXY( keyboard.x, keyboard.y)
      */
			view.x = renderCircular ? view.x%mapWidth:view.x
			view.y = renderCircular ? view.y%mapHeight:view.y
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