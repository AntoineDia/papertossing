function Bin(config, img){
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