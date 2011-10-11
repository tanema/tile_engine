function newKeyboard(){	var keyboard = {		orientation: {}, actor: 0,LEFT: 37,RIGHT: 39,UP: 38,DOWN: 40,console: 192,		doc_click: false, ctx_click:false, _focus: false, ctx: 0,		thrust: 10,	maxSpeed: 100, view: 0, tile_engine:0, 		offset_x: 0, offset_y: 0, key_down: false,			init: function(TileEngine, to_move) {			keyboard.ctx = TileEngine.canvas;			keyboard.tile_engine = TileEngine;			keyboard.actor = to_move;			TileEngine.physics_engine.add_actor(keyboard, to_move.x, to_move.y, to_move.width, to_move.height);			keyboard.offset_x = TileEngine.width * 0.5;			keyboard.offset_y = TileEngine.height * 0.5;			keyboard.ingnore_collide = true; //this stops the physics engine from thinking the keyboard is colliding with the actor			$(keyboard.ctx).mouseup(function(event){keyboard.ctx_click = true;})			$(document).keydown(function(event){keyboard.keydown(event)})								 .keyup(function(event){keyboard.keyup(event)})								 .mousedown(function(event){keyboard.mousedown(event)})								 .mouseup(function(event){keyboard.mouseup(event)})		},		keydown: function (event){			if(!keyboard._focus)				return			keyboard.orientation[event.keyCode] = true;			keyboard.tile_engine.active_controller = keyboard;			keyboard.key_down = true;		},		keyup: function (event){			keyboard.orientation[event.keyCode] = false;			keyboard.key_down = false;		},		mousedown: function (){			keyboard.doc_click = true;		},		mouseup: function (){			keyboard._focus = keyboard.ctx_click && keyboard.doc_click;			$('canvas').css("border", (keyboard._focus ? "2px solid lightblue":""))			if(keyboard._focus)				keyboard.setXY(keyboard.actor.x,keyboard.actor.y);			keyboard.doc_click = keyboard.ctx_click = false;		},		accellerate: function(){			if(!keyboard._focus)				return							if(keyboard.orientation[keyboard.console]){				Console.hidden ? Console.show() : Console.hide();				keyboard.orientation[keyboard.console] = false			}			if (keyboard.orientation[keyboard.LEFT]){				keyboard.dx -= keyboard.thrust;				keyboard.actor.left();			}			if (keyboard.orientation[keyboard.RIGHT]){				keyboard.dx += keyboard.thrust;				keyboard.actor.right();			}			if (keyboard.orientation[keyboard.UP]){				keyboard.dy += keyboard.thrust;				keyboard.actor.up();			}			if (keyboard.orientation[keyboard.DOWN]){				keyboard.dy -= keyboard.thrust;				keyboard.actor.down();			}			//speed limit			var currentSpeed = Math.sqrt((keyboard.dx * keyboard.dx) + (keyboard.dy * keyboard.dy));			if (currentSpeed > keyboard.maxSpeed){				keyboard.dx *= keyboard.maxSpeed/currentSpeed;				keyboard.dy *= keyboard.maxSpeed/currentSpeed;			}		},		update: function (){			var mapwidth = keyboard.tile_engine.mapWidth,				  mapheight = keyboard.tile_engine.mapHeight;				  			if(keyboard.tile_engine.renderCircular){				if(keyboard.tile_engine.view.viewWidth >= mapwidth+mapwidth){					keyboard.tile_engine.view.x = 0;					keyboard.setXY( keyboard.x - mapwidth, keyboard.y)				}else if(keyboard.tile_engine.view.x <= -mapwidth){					keyboard.tile_engine.view.x = 0;					keyboard.setXY( keyboard.x + mapwidth, keyboard.y)				}				if(keyboard.tile_engine.view.viewHeight >= mapheight+mapheight){					keyboard.tile_engine.view.y = 0;					keyboard.setXY( keyboard.x, keyboard.y - mapheight )				}else if(keyboard.tile_engine.view.y <= -mapheight){					keyboard.tile_engine.view.y = 0;					keyboard.setXY( keyboard.x, keyboard.y + mapheight )				}			}			keyboard.actor.setXY( keyboard.x, keyboard.y)			keyboard.tile_engine.view.x = keyboard.tile_engine.view.x+(keyboard.x - (keyboard.tile_engine.view.x + keyboard.offset_x)) * 0.05			keyboard.tile_engine.view.y = keyboard.tile_engine.view.y+(keyboard.y - (keyboard.tile_engine.view.y + keyboard.offset_y)) * 0.05			keyboard.tile_engine.view.viewWidth = keyboard.tile_engine.view.x + keyboard.tile_engine.width;			keyboard.tile_engine.view.viewHeight = keyboard.tile_engine.view.y + keyboard.tile_engine.height;		}	}	return keyboard;}