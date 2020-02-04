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
