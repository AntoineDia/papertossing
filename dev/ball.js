function Ball(config){
  // nums
  this.size = config.width
  //status
  this.launched = false
  this.falled = false
  this.bounced = false
  this.finished = false
  this.scored = false
  this.scale = true
  //vectors
  this.poz = new Vector(0,0)
  this.acc =  new Vector(0,0)
  this.vel = new Vector(0,0)
}
Ball.prototype.draw = function(game){
  var poz = game.state.ballOrigin.copy().add(this.poz)
  game.ctx.drawImage(game.assets.ball,
    poz.x - this.size/2, poz.y - this.size/2,
    this.size, this.size
  )
}
Ball.prototype.launch = function(){
  this.launched = true
}
Ball.prototype.addF = function(f){
  this.acc.add(f)
  return this
}
Ball.prototype.checkEndTry = function(){
  // var binHb = bin.getHitbox()
  // if(
  //   this.poz.x > binHb.l.up.x && this.poz.x < binHb.r.up.x && this.poz.y > bin.poz.y && !this.scored && !this.finished
  // ){
  //   this.scored = true
  //   score++
  //   if(difficultyLevel === null) difficultyLevel = 0
  //   else if(difficultyLevel < 3) difficultyLevel++
  // }
  // if(this.poz.y + this.radius > bin.poz.y + bin.height/2){
  //   this.vel.y *= -0.7
  //   this.poz.y -= 3
  //   this.finished = true
  // }
  if(this.scored || this.finished){
    if(!this.bounced){
      setTimeout(function(){
        resetTry()
      }, 800)
    }
    this.bounced = true
  }
}
Ball.prototype.update = function(game){
  if(this.vel.y > 0) this.falled = true
  if(this.falled){
    // if(game.data.keeper) this.keeperColision()
    this.checkEndTry(game.bin)
  }
  // this.checkBinColisions()
  if(this.launched){
    if(this.scale) this.size /= 1.005
    if(this.size < 40) this.size = 40
    this.radius = this.size / 2
    this.addF(game.forces.gravity).addF(game.forces.launch).addF(game.forces.wind)
    game.forces.launch.scale(1/1.11)
    this.vel.add(this.acc)
    this.poz.add(this.vel)
    this.acc.scale(0)
  }
}
Ball.prototype.checkBinColisions = function(){
  // if(config.bin.type = 'front') return
  var hitbox = bin.getHitbox()
  var top = bin.poz.y + bin.hitbox.l.up.y - bin.height / 2
  for(var direction in hitbox){
    var dir = hitbox[direction]
    var line = dir.dw.copy().sub(dir.up)
    var ballToTopLine = this.poz.copy().sub(dir.up)
    var projected = line.project(ballToTopLine).add(dir.up)
    var distance = projected.copy().sub(this.poz).magn()
    if(this.poz.y > top - this.radius){
      if(distance < this.radius && !binBounced){
        var bounceDir = projected.copy().sub(this.poz).normalize().scale(-1)
        if(this.vel.x < 0) this.vel.x *= -1
        this.vel.y *= bounceDir.y
        this.vel.x *= bounceDir.x
        binBounced = true
        if(timedOut === null) timedOut = setTimeout(function(){
          binBounced = false
          timedOut = null
        }, 30)
      }
    }
  }

}
Ball.prototype.keeperColision = function(){
  if(Math.abs(this.poz.x - keeper.poz.x)< keeper.width/2 && (!this.finished && !this.scored)){
    this.finished = true
    this.scale = false
    this.vel.scale(0)
  }
}