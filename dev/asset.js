var Asset = function(){
  return this
}
Asset.prototype.setImage = function(name, src){
  this[name] = new Image()
  this[name].src = src
}