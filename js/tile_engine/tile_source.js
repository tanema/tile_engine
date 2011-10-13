function newTileSource(){ //image used to create tile 
	var TileSource = {
		canvas: 0, //main canvas object
		ctx: 0, //main canvas drawing context
		sourceImage: 0, //image source for this tile
		init: function(width, height, src_x, src_y, source){
			TileSource.sourceImage = source;  //set image source
			TileSource.canvas = document.createElement('canvas');
			TileSource.ctx = TileSource.canvas.getContext('2d'); //create main drawing canvas
			TileSource.canvas.setAttribute('width', width); //set tile source canvas size
			TileSource.canvas.setAttribute('height', height);
			TileSource.ctx.drawImage(TileSource.sourceImage.image, src_x, src_y, width, height, 0, 0, width, height); //draw image to tile source canvas
		}
	};
	return TileSource;
};