This is a (soon to be) stale project, mostly because I wanted to bring it beyond just a tile engine, but I want to keep this available for anyone comming from John Grahams site.this a a working version from what I learn from <a href="http://www.johnegraham2.com/web-technology/javascript-2d-tile-engine-canvas-helper-objects/">Johne Graham</a> and implemented a dynamic viewport. Please try this out in Chrome before any other browser. I believe it is because Chrome uses V8, but chrome will get around 233fps where all other browsers get only around 90fps.  message.js is just a helper file for displaying debug output  game.js has the game loop and game initializers for now in the future this file will become obsolete because I hope to  create initializers that take JSON, and then just move the gameloop into tilemap.js  tilemap.js is where all the work is done!  If this is helpful, I would like to know! please send me any comments or critisisms.  TODO's still not happy with collision detection better comments (I am terrible at them I am young after all) tests