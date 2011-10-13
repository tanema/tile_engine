
function newView(TileEngine, init_x, init_y, vw, vh){
	var view = {
		tileEngine:TileEngine,x: init_x || 0,y: init_y || 0,
		viewWidth: vw || 0,	viewHeight: vh || 0,xoffset: 0,
		yoffset: 0,
		init: function(x,y){
			view.update()
		},
		update : function(){
			view.x = view.tileEngine.renderCircular ? view.x%view.tileEngine.mapWidth:view.x
			view.y = view.tileEngine.renderCircular ? view.y%view.tileEngine.mapHeight:view.y
			view.viewWidth = view.x + view.tileEngine.width;
			view.viewHeight = view.y + view.tileEngine.height;
		},
		isInView: function(check){
			return (check.x+check.width > this.x && check.x <= this.viewWidth)&&(check.y+check.height > this.y && check.y <= this.viewHeight)
		},
		up: function(){
			var v = $.extend({}, this);
			if(v.y < 0){
				v.y += TileEngine.mapHeight;
				v.viewHeight = TileEngine.mapHeight;//no need to do the extra calc for the actual width
				v.yoffset = -TileEngine.mapHeight;
			}
			return v;
		},
		down: function(){ 
			var v = $.extend({}, this);
			if(v.viewHeight > TileEngine.mapHeight){
				v.y = 0
				v.viewHeight -= TileEngine.mapHeight;
				v.yoffset = TileEngine.mapHeight;
			}
			return v;
		},
		left: function(){ 
			var v = $.extend({}, this);
			if(v.x < 0){
				v.x += TileEngine.mapWidth;
				v.viewWidth = TileEngine.mapWidth;//no need to do the extra calc for the actual width
				v.xoffset = -TileEngine.mapWidth;
			}
			return v;
		},
	  right: function(){ 
			var v = $.extend({}, this);
			if(v.viewWidth > TileEngine.mapWidth){
				v.x = 0
				v.viewWidth -= TileEngine.mapWidth;
				v.xoffset = TileEngine.mapWidth;
			}
			return v;
		}
	}
	return view;
}