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