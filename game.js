function game(config){
  'use strict';
  var seeTrajectory = false
  var now, then, elapsed
  var score, tries
  var ctx, assets
  var balls, iBall, bin, keeper, binBounced = false, timedOut = null, endGame = false
  var difficultyLevel = null
  var forces = {
    gravity: new Vector(0, 0.13),
    wind: new Vector(0, 0),
    launch: new Vector(0, 0),
    initLauch: new Vector(0, 0)
  }
  var launchInfos = {
    start: new Vector(0,0),
    end: new Vector(0,0)
  }
  var events = {
    start: function(e){
      if(balls[iBall].launched) return
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
      deg = deg / 10
      deg = Math.round(deg * 2) / 2
      deg = deg * 10
      radians = deg * (Math.PI/180)
      forces.launch = Vector.fromAngle(radians)
      forces.launch.y = -0.90
      forces.launch.x /= config.trajectoryThighness
      forces.initLauch = forces.launch.copy()
      if(config.keeper) keeper.updateDest()
      balls[iBall].launch()
    }
  }
  var wind = {
    newForce: function(){
      if(difficultyLevel === null){
        forces.wind.scale(0)
      } else if(difficultyLevel === 3){
        var min = 3
        var max = 5
        var windForce = Math.floor(Math.random() * (max - min + 1)) + min
        forces.wind = new Vector(windForce/100,0)
        if(Math.random() >= 0.5) forces.wind.x *= -1
      } else {
        forces.wind = new Vector((difficultyLevel + 3)/100,0)
        if(Math.random() >= 0.5) forces.wind.x *= -1
      }
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
    var $scoreBoard = document.getElementById('scoreBoard')
    $scoreBoard.innerHTML = ''

    var $tries = document.createElement('div')
    $tries.style.display = 'flex'
    $tries.style.position = 'absolute'
    $tries.style.left = '50%'
    $tries.style.transform = 'translateX(-100%)'
    $tries.style.marginLeft = '-35px'
    var $ballIndicator = document.createElement('div')
    var img = (balls[iBall] || balls[0]).img.cloneNode()
    $ballIndicator.style.margin = '0 3px'
    $ballIndicator.appendChild(img)
    img.style.width = '15px'
    img.style.height = '15px'
    var triesLeft = document.createElement('span')
    triesLeft.innerHTML = tries
    $tries.appendChild(triesLeft)
    $tries.appendChild($ballIndicator)

    var $score = document.createElement('div')
    $score.style.position = 'absolute'
    $score.style.left = '50%'
    $score.style.transform = 'translateX(-50%)'
    $score.innerHTML = score

    $scoreBoard.appendChild($score)
    $scoreBoard.appendChild($tries)
    var $span = document.createElement('span')
    var $wind = document.getElementById('wind')
    if(config.wind){
      var windComprenhensible = Math.abs(Math.floor(forces.wind.x * 10000) / 10)
      if(windComprenhensible !== 0) windComprenhensible = (windComprenhensible -20) * 3
      var zx = 0
      switch(windComprenhensible){
        case 0: zx = 0
          break;
        case 30: zx = 1
          break;
        case 60: zx = 2
          break;
        case 90: zx = 3
        break;
      }
      $span.innerHTML = ''
      $wind.style.backgroundImage = 'url(' + config.wind.asset + ')'
      $wind.style.backgroundSize = 187.5 * 4 + 'px 100px'
      $wind.style.backgroundRepeat = 'no-repeat'
      $wind.style.backgroundPosition = (-(assets.wind.width / 8) * zx) + 'px top'
      // $wind.style.backgroundPosition = 'right 100px'
      $wind.style.width = '187.5px'
      $wind.style.height = "100px"
    }
    if(endGame) {
      $span.style.fontSize = '30px'
      $span.innerHTML = 'End Game</br> Score: ' + score
    }
    $wind.innerHTML = ''
    $wind.appendChild($span)
  }
  function resetTry(){
    tries--
    if(tries === 0){
      endGame = true
      var $canvas = document.querySelector('#box-game-panel canvas')
      $canvas.removeEventListener('mousedown', events.start)
      $canvas.removeEventListener('mouseup', events.end)
      $canvas.removeEventListener('touchstart', events.start)
      $canvas.removeEventListener('touchend', events.end)
    }
    iBall++
    if(config.wind) wind.newForce()
    updateDOM()
  }
  function drawTrajectories(){
    if(balls[iBall].launched){
      // launch events
      ctx.beginPath()
      ctx.lineWidth = 2
      ctx.strokeStyle = 'red'
      ctx.moveTo(
        launchInfos.start.x,
        launchInfos.start.y
      )
      ctx.lineTo(
        launchInfos.end.x,
        launchInfos.end.y
      )
      ctx.stroke()
      //prosscess launch
      ctx.beginPath()
      ctx.strokeStyle = 'pink'
      ctx.lineWidth = 2
      ctx.moveTo(
        ctx.canvas.width/2, ctx.canvas.height - config.ball.width/2 - 15
      )
      ctx.lineTo(
        ctx.canvas.width/2 + forces.initLauch.copy().scale(200).x,
        (ctx.canvas.height - config.ball.width/2 - 15) + forces.initLauch.copy().scale(200).y
      )
      ctx.stroke()
    }
  }
  function draw(){
    ctx.clearRect(0,0, ctx.canvas.width, ctx.canvas.height)
    if(balls[iBall].falled){
      if(balls[iBall].scored){
        bin.draw('back')
        balls[iBall].draw()
        if(keeper) keeper.draw()
        bin.draw('front')
      } else {
        bin.draw('back')
        if(keeper) keeper.draw()
        balls[iBall].draw()
        bin.draw('front')
      }
    } else {
      bin.draw('back')
      bin.draw('front')
      if(keeper) keeper.draw()
      balls[iBall].draw()
    }
    if(config.wind)  wind.draw()
    if(seeTrajectory) drawTrajectories()
  }
  function frame(){
    window.requestAnimationFrame(frame)
    now = Date.now()
    if (now - then > 1000/70) {
      then = now
      if(endGame) return
      draw()
      balls[iBall].update()
      if(config.keeper && !balls[iBall].launched) keeper.iddle()
      if(config.keeper && balls[iBall].launched) keeper.move()

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

    if(config.keeper) keeper = new Keeper(assets.keeper)
    // wind
    if(config.wind){
      for(var i = 0; i < 150; i++){
        var min = 0
        var maxX = ctx.canvas.width
        var maxY = ctx.canvas.height
        var x = Math.floor(Math.random() * (maxX - min + 1)) + min
        var y = Math.floor(Math.random() * (maxY - min + 1)) + min
        wind.parts.push(new Vector(x, y))
      }
      wind.newForce()
    }
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

      var $tries = document.createElement('div')
      $tries.id = 'tries'
      $box.appendChild($tries)

      var $wind = document.createElement('div')
      $wind.id = 'wind'
      $box.appendChild($wind)

      var $scoreBoard = document.createElement('div')
      $scoreBoard.id = 'scoreBoard'
      $scoreBoard.style.backgroundImage = 'url(' + config.scoreBoard.assets[0] + ')'
      $scoreBoard.style.backgroundSize = 'cover'
      $scoreBoard.style.backgroundPosition = 'center'
      $box.appendChild($scoreBoard)

      $box.style.backgroundImage = 'url(' + config.background + ')'
      $box.style.backgroundSize = 'cover'
      $box.style.backgroundPosition = 'center'

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
          if(config.keeper) tempAssets.keeper = []
          Object.keys(tempAssets).forEach(function(thing){
            config[thing].assets.forEach(function(src){
              var tempImg = new Image()
              loadAsset(tempImg, src).then(function(){
                tempAssets[thing].push(tempImg)
                if(
                  tempAssets.ball.length === config.ball.assets.length
                  && tempAssets.bin.length === config.bin.assets.length
                ) if(tempAssets.keeper){
                  if(tempAssets.keeper.length === config.keeper.assets.length) resolve(tempAssets)
                } else resolve(tempAssets)
              })
            })
          })
        })
      }
      getAssets().then(function(imagesData){
        assets = imagesData
        if(config.wind) {
          assets.wind = new Image()
          assets.wind.src = config.wind.asset
        }
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
    this.scale = true
    //vectors
    this.poz = new Vector(ctx.canvas.width/2, ctx.canvas.height - this.radius - 15)
    this.acc =  new Vector(0,0)
    this.vel = new Vector(0,0)
    //image
    this.img = img
  }
  Ball.prototype.draw = function(){
    // ctx.save()
    // ctx.translate(this.poz.x, this.poz.y)
    // var vel = this.vel.copy()
    // vel.y *= -1
    // vel.x *= -1
    // ctx.rotate((vel.angle()))
    // ctx.translate(-(this.poz.x), -(this.poz.y))
    ctx.drawImage(this.img,
      this.poz.x - this.radius, this.poz.y - this.radius,
      this.size, this.size
    )
    // ctx.restore()
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
      if(config.bin.type === 'top') this.checkBinColisions()
    }
    if(config.bin.type === 'front') this.checkBinColisions()
    if(this.launched){
      if(this.scale) this.size /= 1.006
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

  function Keeper(img){
    this.dir = 1
    this.img = img[0]
    var w = img[0].width
    this.width = config.keeper.width
    this.height = this.width / (w / img[0].height)
    this.poz = new Vector(ctx.canvas.width/2, bin.poz.y + bin.height - this.height*1.4)
    this.origin = this.poz.copy()
    this.destination = null
  }
  Keeper.prototype.draw = function(){
    ctx.drawImage(this.img,
      this.poz.x - this.width/2 , this.poz.y - this.height/2,
      this.width, this.height
    )
  }
  Keeper.prototype.iddle = function(){
    var l = this.origin.x -13
    var r = this.origin.x + 13
    this.poz.x += this.dir
    if(this.poz.x <= l) this.dir = 1
    if(this.poz.x > r) this.dir = -1
  }
  Keeper.prototype.updateDest = function(){
    var hb = bin.getHitbox()
    var min = hb.l.dw.x + this.width/4
    var max = hb.r.dw.x - this.width/4
    var ladder = max - min
    var angleLaunch = (forces.launch.copy().scale(-1).angle() * (180/Math.PI)) -69

    if(config.chances[iBall]){
      if(angleLaunch > 20)this.destination = min + this.width /2
      else this.destination = max - this.width /2
    } else {
      var added = ladder / 41 * angleLaunch
      this.destination = min + added
    }

    if(this.destination > this.poz.x) this.dir = 1
    else this.dir = -1
  }
  Keeper.prototype.move = function(){
    this.poz.x += this.dir * 3
    if(Math.abs(this.poz.x - this.destination) <= 3)  this.dir = 0
  }

  function Bin(imgs){
    if(!!~imgs[0].src.indexOf('front')) this.imgs = {
      front: imgs[0], back: imgs[1]
    }
    else if(!!~imgs[0].src.indexOf('back')) this.imgs = {
      front: imgs[1], back: imgs[0]
    }
    else if(Object.keys(imgs).length = 1) {
      this.imgs = {
        front: new Image(), back: imgs[0]
      }
      this.imgs.front.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw=='
    }
    var w = imgs[0].width
    this.width = config.bin.width
    this.height = this.width / (w / imgs[0].height)
    if(config.bin.type === "top")
      this.poz = new Vector(ctx.canvas.width/2, 250)
    else if(config.bin.type === "front"){
      if(config.bin.position) this.poz = new Vector(ctx.canvas.width/2, config.bin.position.y)
      else this.poz = new Vector(ctx.canvas.width/2, 230)
    }
    if(config.bin.hitbox){
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
}