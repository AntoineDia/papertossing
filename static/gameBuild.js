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
  console.log('drawball !')
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
  var binHb = bin.getHitbox()
  if(
    this.poz.x > binHb.l.up.x && this.poz.x < binHb.r.up.x && this.poz.y > bin.poz.y && !this.scored && !this.finished
  ){
    this.scored = true
    score++
    if(difficultyLevel === null) difficultyLevel = 0
    else if(difficultyLevel < 3) difficultyLevel++
  }
  if(this.poz.y + this.radius > bin.poz.y + bin.height/2){
    this.vel.y *= -0.7
    this.poz.y -= 3
    this.finished = true
  }
  if(this.scored || this.finished){
    if(!this.bounced){
      setTimeout(function(){
        resetTry()
      }, 800)
    }
    this.bounced = true
  }
}
Ball.prototype.update = function(){
  if(this.vel.y > 0) this.falled = true
  if(this.falled){
    if(config.keeper) this.keeperColision()
    this.checkEndTry()
  }
  this.checkBinColisions()
  if(this.launched){
    if(this.scale) this.size /= 1.005
    if(this.size < 40) this.size = 40
    this.radius = this.size / 2
    this.addF(forces.gravity).addF(forces.launch).addF(forces.wind)
    forces.launch.scale(1/1.11)
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

var Dom = function(holderid){
  this.holder = document.getElementById(holderid)
}
Dom.prototype.setElement = function(elname, id){
  this[id] = document.createElement(elname)
  this[id].id = id
  this.holder.appendChild(this[id])
}
Dom.CSS = function(ruleSet){
  function stringify(rule){
    return rule.selector + '{' + Object.keys(rule.style).map(function(prop){
      return prop + ':' + rule.style[prop] + ';'
    }).join('') + '}'
  }
  var $style = document.createElement('style')
  $style.innerHTML = ruleSet.constructor === Array ?
    ruleSet.map(stringify).join('') : stringify(ruleSet)
  document.body.appendChild($style)
}

var Game = function(config){
  this.data = config
  this.state = {
    playing: false,
    endTry: false,
    launch: { start: new Vector(0,0), end: new Vector(0,0) },
    score: 0,
    tries: config.tries,
    ballOrigin: new Vector()
  }
  this.ctx = null
  this.assets = new Asset()
  this.dom = new Dom('box-game-panel')
  this.ball = new Ball(config.ball)
  this.setup()
}
Game.prototype.setup = function(){
  this.dom.setElement('canvas','canvasGame')
  this.dom.canvasGame.width = this.dom.holder.clientWidth
  this.dom.canvasGame.height = this.dom.holder.clientHeight
  this.ctx = this.dom.canvasGame.getContext('2d')
  this.dom.setElement('div','scoreBoard')
  Dom.CSS([
    {
      selector: '#box-game-panel',
      style: {
        'background-image': 'url(' + this.data.background + ')',
        'background-size': 'cover',
        'background-position': 'center'
      }
    },
    {
      selector: '#scoreBoard',
      style: {
        'background-image': 'url(' + this.data.scoreBoard.asset + ')',
        'background-size': 'cover',
        'background-position': 'center'
      }
    }
  ])
  this.dom.canvasGame.addEventListener('mousedown', this.startLaunch)
  this.dom.canvasGame.addEventListener('mouseup', this.endLaunch)
  this.dom.canvasGame.addEventListener('touchstart', this.startLaunch)
  this.dom.canvasGame.addEventListener('touchend', this.endLaunch)
  this.assets.setImage('ball', this.data.ball.asset)
  this.assets.setImage('bin', this.data.bin.asset)
  if(this.data.keeper) this.assets.setImage('keeper', this.data.keeper.asset)
}
Game.prototype.startLaunch = function(e){
  // if(balls[iBall].launched) return
  // var rect = e.target.getBoundingClientRect()
  // launchInfos.start.x = (e.clientX || event.touches[0].pageX) - rect.left
  // launchInfos.start.y = (e.clientY || event.touches[0].pageY) - rect.top
  // if(launchInfos.start.copy().sub(balls[iBall].poz).magn() > balls[iBall].radius){
  //   launchInfos.start.scale(0)
  // }
}
Game.prototype.endLaunch = function(e){
  // if(launchInfos.start.magn() === 0) return
  // var rect = e.target.getBoundingClientRect()
  // launchInfos.end.x = (e.clientX || event.changedTouches[0].pageX) - rect.left
  // launchInfos.end.y = (e.clientY || event.changedTouches[0].pageY) - rect.top
  // if(
  //   launchInfos.start.x - launchInfos.end.x === 0
  //   && launchInfos.start.y - launchInfos.end.y === 0
  // ) return
  // forces.launch = launchInfos.start.copy().sub(launchInfos.end)
  // forces.launch.normalize().scale(-1)
  // var radians = forces.launch.angle()
  // var deg = radians * (180/Math.PI)
  // deg = deg / 10
  // deg = Math.round(deg * 2) / 2
  // deg = deg * 10
  // radians = deg * (Math.PI/180)
  // forces.launch = Vector.fromAngle(radians)
  // forces.launch.y = -0.90
  // forces.launch.x /= 3
  // forces.initLauch = forces.launch.copy()
  // keeper.updateDest()
  // balls[iBall].launch()
}
Game.prototype.init = function(){
  console.log('init')
  this.state.ballOrigin.x = this.ctx.canvas.width/2
  this.state.ballOrigin.y = this.ctx.canvas.height - this.data.ball.width /1.5
  this.state.playing = true
  window.requestAnimationFrame(this.loop.bind(this))
}
Game.prototype.draw = function(){
  this.ctx.clearRect(0,0, this.ctx.canvas.width, this.ctx.canvas.height)
  this.ball.draw(this)
}
Game.prototype.update = function(){

}
Game.prototype.loop = function(){
  this.draw()
  this.update()
  if(this.state.playing) window.requestAnimationFrame(this.loop.bind(this))
}
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
