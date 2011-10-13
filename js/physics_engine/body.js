function Body(x, y, width, height){
  var body = {
      x: x, y: y, px: x, py: y, dx: 0, dy: 0,
      width: width, height: height,
      decay: 0.97,
      setXY: function(x,y){
        this.px = x;
        this.py = y;
        this.x = x;
        this.y = y;
      },
      accelerate: function(delta){
        var last = this.x
        this.x += this.dx * delta * delta;
        this.y -= this.dy * delta * delta;	
      },
      inertia: function(delta){
        var diffx = this.x - this.px;
        var diffy = this.y - this.py;
        this.px = this.x;
        this.py = this.y;
        this.x += diffx * this.decay;
        this.y += diffy * this.decay;
      }
    }
    return body;
}