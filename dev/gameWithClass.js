var configuration = {
  raninbow: false,
  trys: 12,
  randomBall: true,
  ball: [
    './assets/paper.png',
    './assets/basketball.png',
    './assets/tennisball.png',
    './assets/voleyball.png',
    './assets/football.png',
  ],
  bin: {
    front: './assets/binfront.png',
    back: './assets/binback.png',
  },
  size: {
    ball: 75,
    bin: 90,
  },
  hitboxBin:{
    top: { x: 3, y: 39 },
    bottom: { x: 63, y: 410 }
  }
}

function game(params){
  'use strict';
  // Classes
  var Vector = VectorClass()
  var Item = ItemClass()
  var Ball = BallClass()
  var Bin = BinClass()

  // Globals
  var ctx, currentBall, balls, bin

  function setup(){
    var $box = document.getElementById('box-game-panel')
    var $canvas = document.createElement('canvas')
    $canvas.width = $box.clientWidth
    $canvas.height = $box.clientHeight
    $box.appendChild($canvas)
    ctx = $canvas.getContext('2d')

    currentBall = 0
    balls = []
    params.ball.forEach(function(ball){
      balls.push(new Ball(ball, 100, 100, params.size.ball))
    })
    bin = new Bin({
      front: params.bin.front,
      back: params.bin.back
    }, 100, 100, params.size.bin)
  }

  function draw(){
    balls[currentBall].draw()
    bin.drawBack()
    bin.drawFront()
  }

  setup()
  draw()

  function VectorClass(){
    var Vector = function(x, y){
      this.x = x || 0
      this.y = y || 0
    }
    Vector.prototype.add = function(vect){
      this.x += vect.x; this.y += vect.y; return this
    }
    Vector.prototype.sub = function(vect){
      this.x -= vect.x; this.y -= vect.y; return this
    }
    Vector.prototype.scale = function(n){
      this.x *= n; this.y *= n; return this
    }
    Vector.prototype.normalize = function(){
      this.scale(1 / this.magn()); return this
    }
    Vector.prototype.magn = function () {
      return Math.sqrt(this.x * this.x + this.y * this.y)
    }
    Vector.prototype.product = function(vect){
      return this.x * vect.x + this.y * vect.y
    }
    Vector.prototype.project = function(vect){
      return this.scale(this.product(vect) / (this.magn() * this.magn()))
    }
    return Vector
  }
  function ItemClass(){
    var Item = function(imgSrc, x, y, w, h){
      switch(typeof imgSrc){
        case 'string':
          this.img = new Image()
          this.img.src = imgSrc
          break;
        case 'object':
          this.imgs = {}
          Object.keys(imgSrc).forEach(function(name){
            this.imgs[name] = new Image()
            this.imgs[name].src = imgSrc[name]
          }.bind(this))
          break;
      }
      Vector.call(this, x, y)
      this.w = w
      this.h = h || w
    }
    Item.prototype = Object.create(Vector.prototype)
    Object.defineProperty(Item.prototype, "constructor", {value: Item})

    Item.prototype.draw = function(){
      if(!this.img.complete || this.img.naturalWidth === 0)
        this.img.onload = this.draw.bind(this)
      ctx.drawImage(this.img, this.x - this.w/2, this.y - this.h/2, this.w, this.h)
    }
    return Item
  }
  function BallClass(){
    var Ball = function(imgSrc, x, y, w){
      Item.call(this, imgSrc, x, y, w)
      this.r = this.w / 2
      this.vel = new Vector()
      this.acc = new Vector()
      this.launched = false
      this.falled = false
      this.bounced = false
    }
    Ball.prototype = Object.create(Item.prototype)
    Object.defineProperty(Ball.prototype, "constructor", {value: Ball})
    return Ball
  }
  function BinClass(){
    var Bin = function(imgSrc, x, y, w){
      Item.call(this, imgSrc, x, y, w)
      this.r = this.w / 2
      this.vel = new Vector()
      this.acc = new Vector()
    }
    Bin.prototype = Object.create(Item.prototype)
    Object.defineProperty(Bin.prototype, "constructor", {value: Bin})


    Bin.prototype.drawFront = function(){
      this.img = this.imgs.front
      this.draw()
    }
    Bin.prototype.drawBack = function(){
      if(this.w === this.h){
        this.h = this.w / (this.imgs.front.width / this.imgs.front.height)
      }
      this.img = this.imgs.back
      this.draw()
    }
    return Bin
  }
}

var isIE = !!window.MSInputMethodContext && !!document.documentMode
if(isIE){
  var $script = document.createElement('script')
  $script.src = 'https://cdn.polyfill.io/v3/polyfill.min.js'
  document.body.appendChild($script)
  $script.onload = function(){ game(configuration) }
} else {
  window.onload = function(){ game(configuration) }
}