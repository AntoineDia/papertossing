// extrapolation ball

'use strict';

var ball = {
  img:  new Image(),
  poz: {x: 0, y: 0},
  size: {x: 0, y: 0},
  vel: {x: 0, y: 0},
  launched: false,
  falled: false,
  draw: function(){
    console.log('ball is drawed')
  },
  launch: function(){
    console.log('add the forces (launch, gravity, wind)')
  },
  scored: function(){
    console.log('return true or false')
  },
  collision: function(){
    console.log('return angle vector or false')
  },
  update: function(){
    console.log('update vel here')
  },
  addForce: function(f){
    console.log('added', f)
  }
}