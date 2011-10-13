function newSourceImage(){ //image used to create tile 
	var SourceImage = {
		imageFilename: 0, //filename for image
		image: 0, //dom image object
		init: function(file){
			SourceImage.imageFilename = file;
			SourceImage.image = new Image();  //create new image object
			SourceImage.image.src = file; //load file into image object
		}
	};
	return SourceImage;
}