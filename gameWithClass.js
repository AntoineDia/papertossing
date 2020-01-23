var configuration = {
  RAINBOW: false,
  trys: 12,
  randomBall: true,
  assets: {
    // Array
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
    }
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

  // Globals
  var ctx

  var ballImg = document.getElementById('ballImg')
  var i = new Item(ballImg, 50, 50, 50)

  function setup(){
    var $box = document.getElementById('box-game-panel')
    var $canvas = document.createElement('canvas')
    $canvas.width = $box.clientWidth
    $canvas.height = $box.clientHeight
    $box.appendChild($canvas)
    ctx = $canvas.getContext('2d')
  }

  function draw(){
    i.draw()
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
    var Item = function(img, x, y, w, h){
      this.img = img
      Vector.call(this, x, y)
      this.w = w
      this.h = h || w
    }
    Item.prototype = Object.create(Vector.prototype)
    Object.defineProperty(Item.prototype, "constructor", {value: Item})

    Item.prototype.draw = function(){
      ctx.drawImage(this.img, this.x - this.w/2, this.y - this.h/2, this.w, this.h)
    }
    return Item
  }
}

window.onload = function(){ game(configuration) }