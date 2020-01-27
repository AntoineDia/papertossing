// extrapolation ball

var config = {
  ball: {
    size: 80,
  }
}

'use strict';

var ctx

var ballInitialpoz = new Vector(250, 500)

function Ball(imgSrc){
  // nums
  this.size = config.ball.size
  this.radius = config.ball.size / 2
  //status
  this.launched = false
  this.falled = false
  this.bounced = false
  //vectors
  this.poz = ballInitialpoz.copy()
  this.acc =  new Vector(0,0)
  this.vel = new Vector(0,0)
  //image
  this.img = new Image()
  this.img.src = imgSrc
}
Ball.prototype.draw = function(){
  ctx.drawImage(this.img,
    this.poz.x - this.radius, this.poz.y - this.radius,
    this.size, this.size
  )
}
Ball.prototype.launch = function(){
  this.launched = true
}
Ball.prototype.update = function(){
  if(this.launched){
    this.size /= 1.004;
    this.radius = this.size / 2
  }
}
Ball.prototype.addForce = function(f){
  this.acc.add(f)
  return this.addForce
}


function Vector(x,y){
  this.x = x; this.y = y
}
Vector.prototype.copy = function(){
  return new Vector(this.x, this.y)
}

var ball = {
  img:  new Image(),
  poz: {x: 0, y: 0},
  size: {x: 0, y: 0},
  vel: {x: 0, y: 0},
  launched: false,
  falled: false,
  draw: function(){
    console.log('ball is drawed')
  },
  launch: function(){
    console.log('add the forces (launch, gravity, wind)')
  },
  scored: function(){
    console.log('return true or false')
  },
  collision: function(){
    console.log('return angle vector or false')
  },
  update: function(){
    console.log('update forces here')
  },
  addForce: function(f){
    console.log('added', f)
  }
}