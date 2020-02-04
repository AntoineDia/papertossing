var Asset = function(){
  return this
}
Asset.prototype.setImage = function(name, src){
  this[name] = new Image()
  this[name].src = src
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
function Bin(config){
  this.width = config.width
  this.height = this.width / (w / imgs[0].height)
  if(config.type === "top")
    this.poz = new Vector(ctx.canvas.width/2, 220)
  else if(config.type === "front"){
    if(config.position) this.poz = new Vector(ctx.canvas.width/2, config.position.y)
    else this.poz = new Vector(ctx.canvas.width/2, 230)
  }
  if(config.hitbox){
    this.hitbox = {
      l: {
        up: new Vector(config.hitbox.top.x, config.hitbox.top.y),
        dw: new Vector(config.hitbox.bottom.x, config.hitbox.bottom.y),
      },
      r: {
        up: new Vector(w-config.hitbox.top.x, config.hitbox.top.y),
        dw: new Vector(w-config.hitbox.bottom.x, config.hitbox.bottom.y)
      }
    }
  }
  else{
    this.hitbox = {
      l: {
        up: new Vector(0, 0),
        dw: new Vector(0, imgs[0].height),
      },
      r: {
        up: new Vector(w, 0),
        dw: new Vector(w, imgs[0].height)
      }
    }
  }
  var ratio = this.width / w
  this.hitbox.l.up.scale(ratio)
  this.hitbox.l.dw.scale(ratio)
  this.hitbox.r.up.scale(ratio)
  this.hitbox.r.dw.scale(ratio)
}
Bin.prototype.getHitbox = function(){
  return {
    l: {
      up: new Vector(this.poz.x + this.hitbox.l.up.x - this.width / 2, this.poz.y + this.hitbox.l.up.y - this.height / 2),
      dw: new Vector(this.poz.x + this.hitbox.l.dw.x - this.width / 2, this.poz.y + this.hitbox.l.dw.y - this.height / 2)
    },
    r: {
      up: new Vector(this.poz.x + this.hitbox.r.up.x - this.width / 2, this.poz.y + this.hitbox.r.up.y - this.height / 2),
      dw: new Vector(this.poz.x + this.hitbox.r.dw.x - this.width / 2, this.poz.y + this.hitbox.r.dw.y - this.height / 2)
    }
  }
}
Bin.prototype.draw = function(type){
  ctx.drawImage(this.imgs[type],
    this.poz.x - this.width/2 , this.poz.y - this.height/2,
    this.width, this.height
  )
  if(config.seeHitbox){
    ctx.strokeStyle = 'red'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(this.poz.x + this.hitbox.l.up.x - this.width / 2, this.poz.y + this.hitbox.l.up.y - this.height / 2)
    ctx.lineTo(this.poz.x + this.hitbox.l.dw.x - this.width / 2, this.poz.y + this.hitbox.l.dw.y - this.height / 2)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(this.poz.x + this.hitbox.r.up.x - this.width / 2, this.poz.y + this.hitbox.r.up.y - this.height / 2)
    ctx.lineTo(this.poz.x + this.hitbox.r.dw.x - this.width / 2, this.poz.y + this.hitbox.r.dw.y - this.height / 2)
    ctx.stroke()
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
    launch: { start: new Vector(0,0), end: new Vector(0,0) },
    score: 0,
    tries: config.tries,
    ballOrigin: new Vector()
  }
  this.ctx = null
  this.forces = {
    gravity: new Vector(0, 0.12),
    wind: new Vector(0, 0),
    launch: new Vector(0, 0),
  }
  this.assets = new Asset()
  this.dom = new Dom('box-game-panel')
  this.ball = new Ball(config.ball)
  this.bin = new Bin(config.bin)
  this.keeper = {
    updateDest: function(){
    }
  }
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
  this.dom.canvasGame.addEventListener('mousedown', this.startLaunch.bind(this))
  this.dom.canvasGame.addEventListener('mouseup', this.endLaunch.bind(this))
  this.dom.canvasGame.addEventListener('touchstart', this.startLaunch.bind(this))
  this.dom.canvasGame.addEventListener('touchend', this.endLaunch.bind(this))
  this.assets.setImage('ball', this.data.ball.asset)
  this.assets.setImage('bin', this.data.bin.asset)
  if(this.data.keeper) this.assets.setImage('keeper', this.data.keeper.asset)
  this.state.ballOrigin.x = this.ctx.canvas.width/2
  this.state.ballOrigin.y = this.ctx.canvas.height - this.data.ball.width /1.5
}
Game.prototype.startLaunch = function(e){
  if(this.ball.launched) return
  var rect = e.target.getBoundingClientRect()
  this.state.launch.start.x = (e.clientX || event.touches[0].pageX) - rect.left
  this.state.launch.start.y = (e.clientY || event.touches[0].pageY) - rect.top
  if(this.state.launch.start.copy().sub(this.ball.poz).magn() > this.ball.radius){
    this.state.launch.start.scale(0)
  }
}
Game.prototype.endLaunch = function(e){
  if(this.state.launch.start.magn() === 0) return
  var rect = e.target.getBoundingClientRect()
  this.state.launch.end.x = (e.clientX || event.changedTouches[0].pageX) - rect.left
  this.state.launch.end.y = (e.clientY || event.changedTouches[0].pageY) - rect.top
  if(
    this.state.launch.start.x - this.state.launch.end.x === 0
    && this.state.launch.start.y - this.state.launch.end.y === 0
  ) return
  this.forces.launch = this.state.launch.start.copy().sub(this.state.launch.end)
  this.forces.launch.normalize().scale(-1)
  var radians = this.forces.launch.angle()
  var deg = radians * (180/Math.PI)
  deg = deg / 10
  deg = Math.round(deg * 2) / 2
  deg = deg * 10
  radians = deg * (Math.PI/180)
  this.forces.launch = Vector.fromAngle(radians)
  this.forces.launch.y = -0.90
  this.forces.launch.x /= 3
  this.forces.initLauch = this.forces.launch.copy()
  this.keeper.updateDest()
  this.ball.launch()
}
Game.prototype.init = function(){
  this.state.playing = true
  window.requestAnimationFrame(this.loop.bind(this))
}
Game.prototype.draw = function(){
  this.ctx.clearRect(0,0, this.ctx.canvas.width, this.ctx.canvas.height)
  this.ball.draw(this)
}
Game.prototype.update = function(){
  if(this.ball.launched) this.ball.update(this)
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
