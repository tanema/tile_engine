/*** function to create and then return a new Tile object */
function newTile(){
	var Tile = {
		x: 0, // X and Y position of this tile
		y: 0, //
		local_x:0, //local x and y of thier position within thier zones
		local_y:0,
		width: 0,
		height: 0,
		baseSourceIndex: 0, //index of tile source in tile engine's source array
		decorationIndex: 0, //index of secondary layer 
		physicsID: 0, //physics type
		darker: 0, // mostly for debug but also for cool effect later maybe!
		init: function(x, y, width, height, source_index, physics_id){ //initialize sprite
			Tile.x = x;
			Tile.y = y;
			Tile.width = width;
			Tile.height = height;
			var sourceNumbers = getBytes(source_index)
			Tile.baseSourceIndex = sourceNumbers[1]; // set index of tile source for this tile
			Tile.decorationIndex = sourceNumbers[0]; 
			Tile.physicsID = physics_id || 0; 
		}
	};
	return Tile;  //returns newly created sprite object
};