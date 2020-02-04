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