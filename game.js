var config = {
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

// todo item class for extra sweetness
// ConstrucorFunction.call(this) for calling coonstructor in other context
// Object.create(ConstrucorFunction.prototype) duplicate constructor
// ConstrucorFunction.prototype.constructor = ConstrucorFunction

var Vector = VectorClass()
var Vow = VowClass()

function game(){
  // Wind asset
  var wind1 = new Image()
  var windSrc = "https://img.icons8.com/ios-glyphs/50/000000/wind.png"
  wind1.src = windSrc
  var wind2 = wind1.cloneNode()
  wind1.style.transform = 'scaleX(-1)'
  //Booleans
  var launched, endTry, falled, special, timedOut, bounced, debounceFall
  // Numbers
  var score, trys
  // Canvas
  var ctx
  // Game object
  var _ = {
    ball: {
      img: [],
      current: 0,
      poz: new Vector(),
      vel: new Vector(),
      acc: new Vector(),
      addF: function(f){
        _.ball.acc.add(f)
      },
      draw: function(){
        ctx.drawImage(_.ball.img[_.ball.current],
          _.ball.poz.x - _.ball.s / 2, _.ball.poz.y - _.ball.s / 2,
          _.ball.s, _.ball.s
        )
      }
    },
    bin: {
      poz: new Vector(),
      drawFront: function(){
        ctx.drawImage(_.bin.front,
          _.bin.poz.x - _.bin.w/2 , _.bin.poz.y -  _.bin.h/2,
          _.bin.w, _.bin.h
        )

        /* hitbox visualisation */
        // ctx.strokeStyle = 'red'
        // ctx.lineWidth = 2
        // ctx.beginPath()
        // ctx.moveTo(
        //   _.bin.poz.x + _.bin.hitbox.l.up.x - _.bin.w / 2,
        //   _.bin.poz.y + _.bin.hitbox.l.up.y - _.bin.h / 2
        // )
        // ctx.lineTo(
        //   _.bin.poz.x + _.bin.hitbox.l.dw.x - _.bin.w / 2,
        //   _.bin.poz.y + _.bin.hitbox.l.dw.y - _.bin.h / 2,
        // )
        // ctx.stroke()
        // ctx.beginPath()
        // ctx.moveTo(
        //   _.bin.poz.x + _.bin.hitbox.r.up.x - _.bin.w / 2,
        //   _.bin.poz.y + _.bin.hitbox.r.up.y - _.bin.h / 2
        // )
        // ctx.lineTo(
        //   _.bin.poz.x + _.bin.hitbox.r.dw.x - _.bin.w / 2,
        //   _.bin.poz.y + _.bin.hitbox.r.dw.y - _.bin.h / 2,
        // )
        // ctx.stroke()
      },
      drawBack: function(){
        ctx.drawImage(_.bin.back,
          _.bin.poz.x - _.bin.w/2 , _.bin.poz.y -  _.bin.h/2,
          _.bin.w, _.bin.h
        )
      }
    },
    force: {
      launch: new Vector(),
      wind: new Vector(),
      gravity: new Vector(0, 0.11)
    },
    launchInfos: {
      start: new Vector(),
      end: new Vector()
    },
    wind: {
      parts: [],
      draw: function(){
        if(_.force.wind.x === 0) return
        ctx.strokeStyle = 'rgba(204, 240, 240, 1)'
        ctx.lineCap = 'round'
        ctx.lineWidth = 0.5
        var wind = _.force.wind.copy()
        wind.x *= 70
        _.wind.parts.forEach(function(part){
          ctx.beginPath()
          ctx.moveTo(part.x, part.y)
          ctx.lineTo(part.x + Math.abs(wind.x * 6), wind.x < 0 ? part.y + 2 : part.y - 2)
          ctx.stroke()
          part.add(wind)
          part.y -= 0.9
          if(part.x > ctx.canvas.width) part.x -= ctx.canvas.width
          if(part.x < 0) part.x += ctx.canvas.width
          if(part.y > ctx.canvas.height) part.y -= ctx.canvas.height
          if(part.y < 0) part.y += ctx.canvas.height
        })
      }
    }
  }
  // events handler
  var throwBall = {
    start: function(e){
      var rect = e.target.getBoundingClientRect()
      _.launchInfos.start.x = (e.clientX || event.touches[0].pageX) - rect.left
      _.launchInfos.start.y = (e.clientY || event.touches[0].pageY) - rect.top
      // _.launchInfos.start.x = _.ball.poz.x
      // _.launchInfos.start.y = _.ball.poz.y
    },
    end: function(e){
      var rect = e.target.getBoundingClientRect()
      _.launchInfos.end.x = (e.clientX || event.changedTouches[0].pageX) - rect.left
      _.launchInfos.end.y = (e.clientY || event.changedTouches[0].pageY) - rect.top
      if(
        _.launchInfos.start.x - _.launchInfos.end.x === 0
        && _.launchInfos.start.y - _.launchInfos.end.y === 0
      ) return
      _.launchInfos.start = _.ball.poz.copy()
      if(!launched) {
        _.launchInfos.start.sub(_.launchInfos.end)
        _.force.launch = new Vector(_.launchInfos.start.x, _.launchInfos.start.y)
        _.force.launch.normalize().inverse()

        var radians = _.force.launch.toAngle()
        var deg = radians * (180/Math.PI)
        deg = deg / 20
        deg = Math.round(deg * 2) / 2
        deg = deg * 20
        radians = deg * (Math.PI/180)
        var newLanch = Vector.fromAngle(radians)

        _.force.launch = newLanch
        _.force.launch.y = -1
        _.force.launch.x /= 1.7
        launched = true
      }
    }
  }

  function setup(){
    return new Vow(function(resolve, rej){
      // HTML
      var $box = document.getElementById('box-game-panel')
      var $canvas = document.createElement('canvas')
      $canvas.width = $box.clientWidth
      $canvas.height = $box.clientHeight
      $box.appendChild($canvas)

      //Events
      $canvas.addEventListener('mousedown', throwBall.start)
      $canvas.addEventListener('mouseup', throwBall.end)
      $canvas.addEventListener('touchstart', throwBall.start)
      $canvas.addEventListener('touchend', throwBall.end)

      // Canvas
      ctx = $canvas.getContext('2d')

      // Assets
      function load(assetName){
        return new Vow(function(resolve, rej){
          switch (assetName){
            case 'ball':
              Vow.all(config.assets.ball.map(function(ball,i){
                return new Vow(function(resolve, rej){
                  _.ball.img[i] = new Image()
                  _.ball.img[i].src = ball
                  _.ball.img[i].onload = resolve
                })
              })).then(resolve)
              break;
            case 'bin':
              Vow.all(Object.keys(config.assets.bin).map(function(name){
                return new Vow(function(resolve, rej){
                  _.bin[name] = new Image()
                  _.bin[name].src  = config.assets.bin[name]
                  _.bin[name].onload  = resolve
                })
              })).then(resolve)
              break;
          }
        })
      }
      Vow.all(Object.keys(config.assets).map(load)).then(resolve)

    })
  }

  function draw(){
    ctx.clearRect(0,0, ctx.canvas.width, ctx.canvas.height)
    if(falled){
      _.bin.drawBack()
      _.ball.draw()
      _.bin.drawFront()
    } else {
      _.bin.drawBack()
      _.bin.drawFront()
      _.ball.draw()
    }
    _.wind.draw()
  }

  function checkScored(){
    var left =  _.bin.poz.x + _.bin.hitbox.l.up.x - _.bin.w / 2
    var rigth =  _.bin.poz.x + _.bin.hitbox.r.up.x - _.bin.w / 2
    if(_.ball.poz.x > left && _.ball.poz.x < rigth){
      if(_.ball.poz.y > _.bin.poz.y && !endTry){
        score++
        endTry = true
      }
    }
    if(_.ball.poz.y + _.ball.s/2 > _.bin.poz.y + _.bin.h/2){
      _.ball.vel.y *= -0.7
      _.ball.poz.y -= 3
      if(debounceFall === null){
        debounceFall = setTimeout(function(){
          endTry = true
          debounceFall = null
        }, 500)
      }
    }
  }

  function update(){
    if(_.ball.vel.y > 0) falled = true
    if(falled){
      checkScored()
      ballColision()
    }
    /* RAINBOW BALL EASTER EGG */
    if(config.RAINBOW || special){
      _.ball.current++
      if(_.ball.current >= _.ball.img.length) _.ball.current = 0
    }

    if(endTry){
      trys--
      if(trys === 0){
        document.getElementById('score').innerHTML = score
        document.getElementById('trys').innerHTML = 'End of game'
        return true
      }
      if(config.randomBall){
        _.ball.current = getNewCurrent()
        function getNewCurrent(){
          var newCurrent
          if(special) newCurrent = Math.floor(Math.random() * (_.ball.img.length + 1))
          else newCurrent = Math.floor(Math.random() * (_.ball.img.length + 2))
          if(newCurrent === _.ball.current) return getNewCurrent()
          if(newCurrent === _.ball.img.length + 1){
            newCurrent = 0
            special = true
          } else special = false
          return newCurrent
        }
      }
      else _.ball.current++
      if(_.ball.current === _.ball.img.length) _.ball.current = 0
      resetTry()
    }
    else if(launched){
      _.ball.s /= 1.004
      if(_.ball.s < 47) _.ball.s = 47

      _.ball.addF(_.force.launch)
      _.ball.addF(_.force.gravity)
      _.ball.addF(_.force.wind)
      _.ball.vel.add(_.ball.acc)
      _.ball.poz.add(_.ball.vel)

      _.force.launch.scale(1/1.11)
      _.ball.acc = new Vector()
    }
  }

  function initGame(){
    score = 0
    trys = config.trys

    _.ball.current = 0

    _.bin.w = config.size.bin
    _.bin.h = _.bin.w / (_.bin.front.width / _.bin.front.height)
    _.bin.poz.x = ctx.canvas.width/2
    _.bin.poz.y = 335

    var w = _.bin.front.width
    _.bin.hitbox = {
      l: {
        up: new Vector(config.hitboxBin.top.x, config.hitboxBin.top.y),
        dw: new Vector(config.hitboxBin.bottom.x, config.hitboxBin.bottom.y),
      },
      r: {
        up: new Vector(w-config.hitboxBin.top.x, config.hitboxBin.top.y),
        dw: new Vector(w-config.hitboxBin.bottom.x, config.hitboxBin.bottom.y)
      }
    }
    var ratio = _.bin.w / w
    _.bin.hitbox.l.up.scale(ratio)
    _.bin.hitbox.l.dw.scale(ratio)
    _.bin.hitbox.r.up.scale(ratio)
    _.bin.hitbox.r.dw.scale(ratio)


    for(var i = 0; i < 150; i++){
      var min = 0
      var maxX = ctx.canvas.width
      var maxY = ctx.canvas.height
      var x = Math.floor(Math.random() * (maxX - min + 1)) + min
      var y = Math.floor(Math.random() * (maxY - min + 1)) + min
      _.wind.parts.push(new Vector(x, y))
    }

    resetTry()
    frame()
  }

  function resetTry(){
    _.ball.s = config.size.ball
    _.ball.vel = new Vector()
    _.ball.poz.x = ctx.canvas.width / 2
    // _.ball.poz.y = ctx.canvas.height - _.ball.s / 1.5
    _.ball.poz.y = ctx.canvas.height - _.ball.s

    if(special) _.force.wind = new Vector()
    else {
      var min = 3
      var max = 5
      var windForce = Math.floor(Math.random() * (max - min + 1)) + min
      _.force.wind = new Vector(windForce/100,0)
      if(Math.random() >= 0.5) _.force.wind.x *= -1

      // _.force.wind = new Vector()
    }

    endTry = false
    launched = false
    falled = false
    bounced = false
    timedOut = null
    debounceFall = null

    document.getElementById('score').innerHTML = score
    document.getElementById('trys').innerHTML = trys

    var windComprenhensible = Math.abs(Math.floor(_.force.wind.x * 10000) / 10)
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
    if(windComprenhensible){
      $wind.appendChild(wind1)
      $wind.appendChild($span)
      $wind.appendChild(wind2)
    } else {
      $wind.appendChild($span)
    }
  }

  function ballColision(){
    var radius = _.ball.s / 2
    var hitbox = {
      top: _.bin.poz.y + _.bin.hitbox.l.up.y - _.bin.h / 2,
      left: {
        up: new Vector(_.bin.poz.x + _.bin.hitbox.l.up.x - _.bin.w / 2, _.bin.poz.y + _.bin.hitbox.l.up.y - _.bin.h / 2),
        dw: new Vector(_.bin.poz.x + _.bin.hitbox.l.dw.x - _.bin.w / 2, _.bin.poz.y + _.bin.hitbox.l.dw.y - _.bin.h / 2)
      },
      rigth: {
        up: new Vector(_.bin.poz.x + _.bin.hitbox.r.up.x - _.bin.w / 2, _.bin.poz.y + _.bin.hitbox.r.up.y - _.bin.h / 2),
        dw: new Vector(_.bin.poz.x + _.bin.hitbox.r.dw.x - _.bin.w / 2, _.bin.poz.y + _.bin.hitbox.r.dw.y - _.bin.h / 2)
      }
    }

    for(var direction in hitbox){
      if(direction === 'top') continue
      var dir = hitbox[direction]
      var line = dir.dw.copy().sub(dir.up)
      var ballToTopLine = _.ball.poz.copy().sub(dir.up)
      var projected = line.project(ballToTopLine).add(dir.up)
      var distance = projected.copy().sub(_.ball.poz).magn()

      if(_.ball.poz.y > hitbox.top - radius){
        if(distance < radius && !bounced){
          var bounceDir = projected.copy().sub(_.ball.poz).normalize().inverse()
          if(_.ball.vel.x < 0) _.ball.vel.x *= -1
          _.ball.vel.y *= bounceDir.y
          _.ball.vel.x *= bounceDir.x
          bounced = true
          if(timedOut === null) timedOut = setTimeout(function(){
            bounced = false
            timedOut = null
          }, 30)
        }
      }
    }
  }

  function frame(){
    draw()
    var end = update()
    if(!end) requestAnimationFrame(frame)
  }

  setup().then(initGame)
}

window.onload = game

// Constructors
function VectorClass(){
  var Vector = function(x, y){
    this.x = x || 0
    this.y = y || 0
  }
  Vector.prototype.add = function(vect){
    this.x += vect.x
    this.y += vect.y
    return this
  }
  Vector.prototype.sub = function(vect){
    this.x -= vect.x
    this.y -= vect.y
    return this
  }
  Vector.prototype.product = function(vect){
    return this.x * vect.x + this.y * vect.y
  }
  Vector.prototype.scale = function(n){
    this.x *= n
    this.y *= n
    return this
  }
  Vector.prototype.magn = function () {
    return Math.sqrt(this.x * this.x + this.y * this.y)
  }
  Vector.prototype.normalize = function(){
    this.scale(1/this.magn())
    return this
  }
  Vector.prototype.inverse = function(){
    this.x *= -1
    this.y *= -1
    return this
  }
  Vector.prototype.toAngle = function(){
    return Math.atan2(this.y, this.x)
  }
  Vector.prototype.project = function(vect){
    return this.copy().scale(this.product(vect)/(this.magn() * this.magn()))
  }
  Vector.fromAngle = function(radians){
    return new Vector(Math.cos(radians), Math.sin(radians))
  }
  Vector.prototype.copy = function(){
    return new Vector(this.x, this.y)
  }
  return Vector
}
function VowClass(){
  var Vow = function(fn){
    var that = this
    this.thens = []
    this.catchs = []
    fn(resolve, reject)
    function resolve(data){
      that.thens.forEach(function(fn){
        fn(data)
      })
    }
    function reject(err){
      that.catchs.forEach(function(fn){
        fn(err)
      })
    }
    return this
  }
  Vow.prototype.then = function(fn){
    this.thens.push(fn)
    return this
  }
  Vow.prototype.catch = function(fn){
    this.catchs.push(fn)
    return this
  }
  Vow.all = function(arrVows){
    return new Vow(function(res, rej){
      var i = 0
      arrVows.forEach(function(vow){
        vow.then(function(){
          i++
          if(i === arrVows.length - 1) res()
        })
      })
    })
  }
  return Vow
}


function popup(url) {
  var pops = window.open(
    url,
    'popUpWindow',
    `
      height=500, width=500,
      left=100, top=100,
      resizable=yes,
      scrollbars=no,
      toolbar=yes,
      menubar=no,
      location=no,
      directories=no,
      status=yes`
  )
}

<iframe width="560" height="315"
src="https://www.youtube-nocookie.com/embed/sr0ayFx4tBY"
frameborder="0"
allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
allowfullscreen></iframe>

document.addEventListener('keyup',function(e){
  if(e.keyCode !== 80) return
  popup('https://www.youtube-nocookie.com/embed/sr0ayFx4tBY')
})

var originalUrl = 'https://www.youtube.com/watch?v=sr0ayFx4tBY'
var popupUrl    = 'https://www.youtube.com/embed/sr0ayFx4tBY'

function popup(url) {

  var pops = window.open("", "", "width=200, height=100")

  pops.document.write("<h1>A new window!</h1>")
  pops.document.body.onblur = function(){
    pops.document.body.focus()
    pops.console.log('loose focus')
  }

/* tests */

window.onfocus = function(){
  this.console.log('focused')
}

function bodyBlur(){
  var myWindow = window
  setTimeout(function(){
    myWindow.focus()
  }, 500)
}

  // var pops = window.open(
  //   url,
  //   'popUpWindow',
  //   `
  //     height=500, width=500,
  //     left=100, top=100,
  //     resizable=yes,
  //     scrollbars=no,
  //     toolbar=no,
  //     menubar=no,
  //     location=no,
  //     directories=no,
  //     status=no`
  // )
  // pops.document.write("<h1>A new window!</h1>")
  // pops.document.body.onblur = function(){
  //   pops.focus()
  //   pops.console.log('loose focus')
  // }
}