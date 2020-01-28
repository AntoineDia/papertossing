var config = {
  tries: 8,
  randomBall: true,
  seeHitbox: false,
  ball: {
    width: 80,
    assets: [
      './assets/paper.png',
      './assets/basketball.png',
      './assets/tennisball.png',
      './assets/voleyball.png',
      './assets/football.png',
    ],
  },
  bin: {
    width: 90,
    assets: [
      './assets/binfront.png',
      './assets/binback.png',
    ],
    hitbox: {
      top:    { x:  3, y:  39 },
      bottom: { x: 63, y: 410 }
    }
  }
}

function game(){
  'use strict';
  var now, then, elapsed
  var score, tries
  var ctx, assets
  var balls, iBall, bin, binBounced = false, timedOut = null, endGame = false
  var forces = {
    gravity: new Vector(0, 0.11),
    wind: new Vector(0, 0),
    launch: new Vector(0, 0)
  }
  var launchInfos = {
    start: new Vector(0,0),
    end: new Vector(0,0)
  }
  var events = {
    start: function(e){
      var rect = e.target.getBoundingClientRect()
      launchInfos.start.x = (e.clientX || event.touches[0].pageX) - rect.left
      launchInfos.start.y = (e.clientY || event.touches[0].pageY) - rect.top
      if(launchInfos.start.copy().sub(balls[iBall].poz).magn() > balls[iBall].radius){
        launchInfos.start.scale(0)
      }
    },
    end: function(e){
      if(launchInfos.start.magn() === 0) return
      var rect = e.target.getBoundingClientRect()
      launchInfos.end.x = (e.clientX || event.changedTouches[0].pageX) - rect.left
      launchInfos.end.y = (e.clientY || event.changedTouches[0].pageY) - rect.top
      if(
        launchInfos.start.x - launchInfos.end.x === 0
        && launchInfos.start.y - launchInfos.end.y === 0
      ) return
      forces.launch = launchInfos.start.copy().sub(launchInfos.end)
      forces.launch.normalize().scale(-1)
      var radians = forces.launch.angle()
      var deg = radians * (180/Math.PI)
      deg = deg / 20
      deg = Math.round(deg * 2) / 2
      deg = deg * 20
      radians = deg * (Math.PI/180)
      forces.launch = Vector.fromAngle(radians)
      forces.launch.y = -1
      forces.launch.x /= 1.8
      balls[iBall].launch()
    }
  }
  var wind = {
    newForce: function(){
      var min = 3
      var max = 5
      var windForce = Math.floor(Math.random() * (max - min + 1)) + min
      forces.wind = new Vector(windForce/100,0)
      if(Math.random() >= 0.5) forces.wind.x *= -1
    },
    parts: [],
    draw: function(){
      if(forces.wind.x === 0) return
      ctx.strokeStyle = 'rgba(204, 240, 240, 1)'
      ctx.lineCap = 'round'
      ctx.lineWidth = 0.5
      var w = forces.wind.copy()
      w.x *= 70
      wind.parts.forEach(function(part){
        ctx.beginPath()
        ctx.moveTo(part.x, part.y)
        ctx.lineTo(part.x + Math.abs(w.x * 6), w.x < 0 ? part.y + 2 : part.y - 2)
        ctx.stroke()
        part.add(w)
        part.y -= 0.9
        if(part.x > ctx.canvas.width) part.x -= ctx.canvas.width
        if(part.x < 0) part.x += ctx.canvas.width
        if(part.y > ctx.canvas.height) part.y -= ctx.canvas.height
        if(part.y < 0) part.y += ctx.canvas.height
      })
    }
  }

  setup().then(initGame)

  function updateDOM(){
    var $tries = document.getElementById('tries')
    $tries.innerHTML = ''
    var $ballIndicator = document.createElement('div')
    $ballIndicator.style.borderRadius = '100%'
    $ballIndicator.style.border = '1.5px solid black'
    for(var i = 0; i < balls.length; i++){
      var $current = $ballIndicator.cloneNode()
      if(i < iBall){
        if(balls[i].scored) $current.style.backgroundColor = 'green'
        else $current.style.backgroundColor = 'red'
      } else if(i === iBall) {
        $current.style.backgroundColor = 'black'
      }
      $current.style.width = '20px'
      $current.style.height = '20px'
      $tries.appendChild($current)
    }
    // document.getElementById('score').innerHTML = score

    var windComprenhensible = Math.abs(Math.floor(forces.wind.x * 10000) / 10)
    if(windComprenhensible !== 0) windComprenhensible = (windComprenhensible -20) * 3
    var txt = ''
    switch(windComprenhensible){
      case 0: txt = 'PAS DE VENT'
        break;
      case 30: txt = 'PETIT VENT'
        break;
      case 60: txt = 'MOYEN VENT'
        break;
      case 90: txt = 'GRAND VENT'
       break;
    }
    var $span = document.createElement('span')
    $span.innerHTML = txt
    var $wind = document.getElementById('wind')
    $wind.innerHTML = ''
    switch(windComprenhensible){
      case 0: $span.style.fontSize = '25px'
        break;
      case 30: $span.style.fontSize = '30px'
        break;
      case 60: $span.style.fontSize = '35px'
        break;
      case 90: $span.style.fontSize = '40px'
       break;
    }
    if(endGame) {
      $span.style.fontSize = '30px'
      $span.innerHTML = 'End Game</br> Score: ' + score
    }
    $wind.appendChild($span)
  }
  function resetTry(){
    tries--
    if(tries === 0) endGame = true
    iBall++
    wind.newForce()
    updateDOM()
  }
  function draw(){
    ctx.clearRect(0,0, ctx.canvas.width, ctx.canvas.height)
    if(balls[iBall].falled){
      bin.draw('back')
      balls[iBall].draw()
      bin.draw('front')
    } else {
      bin.draw('back')
      bin.draw('front')
      balls[iBall].draw()
    }
    wind.draw()
  }

  function frame(timestamp){
    window.requestAnimationFrame(frame)
    now = Date.now()
    if (now - then > 1000/70) {
      then = now
      if(endGame) return
      draw()
      balls[iBall].update()
    }
  }
  function startLoop() {
    then = Date.now()
    frame()
  }
  function initGame(){
    score = 0
    tries = config.tries
    iBall = 0
    // balls preparation
    balls = []
    var imgIndex = 0
    for(var i = 0; i < tries; i++){
      balls.push(new Ball(assets.ball[imgIndex]))
      if(config.randomBall){
        function getRandom(){
          var temp = Math.floor(Math.random() * (assets.ball.length))
          if(temp === imgIndex) return getRandom()
          return temp
        }
        imgIndex = getRandom()
      }
      else{
        imgIndex++
        if(imgIndex === assets.ball.length) imgIndex = 0
      }
    }
    // bin preparation
    bin = new Bin(assets.bin)
    // wind
    for(var i = 0; i < 150; i++){
      var min = 0
      var maxX = ctx.canvas.width
      var maxY = ctx.canvas.height
      var x = Math.floor(Math.random() * (maxX - min + 1)) + min
      var y = Math.floor(Math.random() * (maxY - min + 1)) + min
      wind.parts.push(new Vector(x, y))
    }
    wind.newForce()
    updateDOM()
    startLoop()
  }
  function setup(){
    return new Promise(function(resole, rej){
      // HTML
      var $box = document.getElementById('box-game-panel')
      var $canvas = document.createElement('canvas')
      $canvas.width = $box.clientWidth
      $canvas.height = $box.clientHeight
      $box.appendChild($canvas)

      //Events
      $canvas.addEventListener('mousedown', events.start)
      $canvas.addEventListener('mouseup', events.end)
      $canvas.addEventListener('touchstart', events.start)
      $canvas.addEventListener('touchend', events.end)

      // Canvas
      ctx = $canvas.getContext('2d')

      // Assets
      function getAssets(){
        return new Promise(function(resolve, rej){
          function loadAsset(img, src){
            return new Promise(function(resolve, rej){
              img.src = src
              img.onload = resolve
            })
          }
          var tempAssets = { ball: [], bin: [] };
          (['ball','bin']).forEach(function(thing){
            config[thing].assets.forEach(function(src){
              var tempImg = new Image()
              loadAsset(tempImg, src).then(function(){
                tempAssets[thing].push(tempImg)
                if(
                  tempAssets.ball.length === config.ball.assets.length
                  && tempAssets.bin.length === config.bin.assets.length
                ) resolve(tempAssets)
              })
            })
          })
        })
      }
      getAssets().then(function(imagesData){
        assets = imagesData
        assets.emptyBall = new Image()
        assets.emptyBall.src = 'https://cdn.onlinewebfonts.com/svg/img_519200.png'
        resole()
      })
    })
  }

  function Ball(img){
    // nums
    this.size = config.ball.width
    this.radius = config.ball.width / 2
    //status
    this.launched = false
    this.falled = false
    this.bounced = false
    this.finished = false
    this.scored = false
    //vectors
    this.poz = new Vector(ctx.canvas.width/2, ctx.canvas.height - this.size)
    this.acc =  new Vector(0,0)
    this.vel = new Vector(0,0)
    //image
    this.img = img
  }
  Ball.prototype.draw = function(){
    ctx.drawImage(this.img,
      this.poz.x - this.radius, this.poz.y - this.radius,
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
      this.poz.x > binHb.l.up.x && this.poz.x < binHb.r.up.x && this.poz.y > bin.poz.y && !this.scored
    ){
      this.scored = true
      score++
    }
    if(this.poz.y + this.radius > bin.poz.y + bin.height/2 && !this.finished){
      this.vel.y *= -0.7
      this.poz.y -= 3
      this.finished = true
    }
    if(this.scored || this.finished){
      if(!this.bounced){
        setTimeout(function(){
          resetTry()
        }, 500)
      }
      this.bounced = true
    }
  }
  Ball.prototype.update = function(){
    if(this.vel.y > 0) this.falled = true
    if(this.falled){
      this.checkEndTry()
      this.checkBinColisions()
    }
    if(this.launched){
      this.size /= 1.004;
      this.radius = this.size / 2
      if(this.size < 47) this.size = 47
      this.addF(forces.gravity).addF(forces.launch).addF(forces.wind)
      forces.launch.scale(1/1.11)
      this.vel.add(this.acc)
      this.poz.add(this.vel)
      this.acc.scale(0)
    }
  }
  Ball.prototype.checkBinColisions = function(){
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

  function Bin(imgs){
    if(!!~imgs[0].src.indexOf('front')) this.imgs = {
      front: imgs[0], back: imgs[1]
    }
    else this.imgs = {
      front: imgs[1], back: imgs[0]
    }
    var w = imgs[0].width
    this.width = config.bin.width
    this.height = this.width / (w / imgs[0].height)
    this.poz = new Vector(ctx.canvas.width/2, 335)
    this.hitbox = {
      l: {
        up: new Vector(config.bin.hitbox.top.x, config.bin.hitbox.top.y),
        dw: new Vector(config.bin.hitbox.bottom.x, config.bin.hitbox.bottom.y),
      },
      r: {
        up: new Vector(w-config.bin.hitbox.top.x, config.bin.hitbox.top.y),
        dw: new Vector(w-config.bin.hitbox.bottom.x, config.bin.hitbox.bottom.y)
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
      ctx.moveTo(
        this.poz.x + this.hitbox.l.up.x - this.width / 2,
        this.poz.y + this.hitbox.l.up.y - this.height / 2
      )
      ctx.lineTo(
        this.poz.x + this.hitbox.l.dw.x - this.width / 2,
        this.poz.y + this.hitbox.l.dw.y - this.height / 2,
      )
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(
        this.poz.x + this.hitbox.r.up.x - this.width / 2,
        this.poz.y + this.hitbox.r.up.y - this.height / 2
      )
      ctx.lineTo(
        this.poz.x + this.hitbox.r.dw.x - this.width / 2,
        this.poz.y + this.hitbox.r.dw.y - this.height / 2,
      )
      ctx.stroke()
    }
  }
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

var isIE = !!window.MSInputMethodContext && !!document.documentMode
if(isIE){
  var $script = document.createElement('script')
  $script.src = 'https://cdn.polyfill.io/v2/polyfill.min.js'
  document.body.appendChild($script)
  $script.onload = function(){ game() }
} else {
  window.onload = function(){ game() }
}