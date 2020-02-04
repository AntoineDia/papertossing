var Asset = function(){
  return this
}
Asset.prototype.setImage = function(name, src){
  this[name] = new Image()
  this[name].src = src
  this[name].onload = function(hey){
    console.log(name, 'loaded', hey)
  }
}