function Vector(x,y){
  this.x = x; this.y = y
}
Vector.prototype.copy = function(){
  return new Vector(this.x, this.y)
}
Vector.prototype.scale = function(n){
  this.x *= n; this.y *= n; return this
}
Vector.prototype.add = function(vect){
  this.x += vect.x; this.y += vect.y; return this
}
Vector.prototype.magn = function () {
  return Math.sqrt(this.x * this.x + this.y * this.y)
}
Vector.prototype.sub = function(vect){
  this.x -= vect.x; this.y -= vect.y; return this
}
Vector.prototype.normalize = function(){
  this.scale(1/this.magn()); return this
}
Vector.prototype.angle = function(){
  return Math.atan2(this.y, this.x)
}
Vector.prototype.product = function(vect){
  return this.x * vect.x + this.y * vect.y
}
Vector.prototype.project = function(vect){
  return this.copy().scale(this.product(vect)/(this.magn() * this.magn()))
}
Vector.fromAngle = function(radians){
  return new Vector(Math.cos(radians), Math.sin(radians))
}