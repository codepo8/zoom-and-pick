(function(){
  var c = document.querySelectorAll('canvas')[1],
      cx = c.getContext('2d'),
      results = document.querySelector('#results'),
      getcodebutton = document.querySelector('#getcode'),
      output = document.querySelector('output'),
      hidecodebutton = document.querySelector('#hidecode'),
      codebox = document.querySelector('#codebox'),
      info = document.querySelector('#info'),
      drop = document.querySelector('#drop'),
      dropx = drop.getContext('2d'),
      pixels = [], p = {},
      out = '', outrgba = '', x = 0, y = 0, v = 0, h = 0;
      c.className = 'hidden';
  
  retrieve();
  paintdrop();
  
  function paintdrop(){
    dropx.restore();
    dropx.translate(0,0);
    dropx.clearRect(0,0,drop.width,drop.height);
  }
  function setcolour() {
    results.innerHTML += '' +
      '<li data-rgba="'+outrgba+'" data-hex="' + out + 
      '"><span style="background:' + out + 
      '"></span>'+out+' <button>x</button></li>';
    store();
  }
  function pixelcolour(x, y) {
    var index = ((y*(pixels.width*4)) + (x*4)),
        red = pixels.data[index],
        green = pixels.data[index + 1],
        blue = pixels.data[index + 2],
        a = pixels.data[index + 3];
    return {r:red, g:green, b:blue, a:a};
  }
  function readcolour(ev) {
    x = ev.pageX - c.offsetLeft;
    y = ev.pageY - c.offsetTop;
    p = pixelcolour(x, y);
    outrgba = 'rgba(' + p.r + ',' + p.g + ',' + p.b + ',' + p.a / 255+')';
    out =  "#" + ((1 << 24) + (p.r << 16) + (p.g << 8) +
           p.b).toString(16).slice(1);
    output.innerHTML = '' + 
      '<b class="label">x: </b><b class="result">' + x + '</b>'+
      '<b class="label"> y: </b><b class="result">' + y + '</b>'+
      '<b class="swatch" '+
         'style="background:rgb(' + p.r + ' ,0,0)">' + p.r + '</b>' + 
      '<b class="swatch" '+
         'style="background:rgb(0,' + p.g + ',0)">' + p.g + '</b>' + 
      '<b class="swatch" '+
         'style="background:rgb(0,0,' + p.b + ')">' + p.b + '</b>'+
      '<b class="swatch opacity" '+
         'style="background:rgba(255,255,255,'+p.a+')">'+p.a+'</b>'+
      '<b class="fullswatch" '+
         'style="background:rgba('+p.r+','+p.g+','+p.b+','+p.a+')">'+
      '</b>';
    drop.width = drop.width;
    dropx.fillStyle = 'black';
    dropx.fillRect(0,0,300,300);
    dropx.save();
    dropx.translate((drop.width / 2) - 35.5, (drop.height / 2) - 17);
    for (v = y - 3; v < y + 3; v++) {
      for (h = x - 3; h < x + 3; h++) {
        p = pixelcolour(h, v);
        dropx.fillStyle = 'rgba(' + p.r + ', ' + p.g +', ' + 
                           p.b + ', ' + p.a / 255+')';
        dropx.fillRect((h - x) * 70, (v - y) * 35, 69, 34); 
      }
    }
    dropx.strokeStyle = 'lime';
    dropx.lineWidth = 2.5;
    dropx.shadowOffsetX = 2;
    dropx.shadowOffsetY = 2;
    dropx.shadowBlur    = 0;
    dropx.shadowColor   = 'black';  
    dropx.strokeRect(-1.5,-1,71.5,36);
  }
  function getfile(ev) {
    this.classList.remove('over');
    var files = ev.dataTransfer.files;
    if (files.length > 0) {
      if (files[0].type.indexOf('image') !== -1) {
        var reader = new FileReader();
        reader.readAsDataURL(files[0]);
        reader.onload = function (ev) {
          var img = new Image();
          img.src = ev.target.result;
          img.onload = function() {
            imagetocanvas(this);
          };
        };
      } 
    }
    ev.preventDefault();
  }
  function imagetocanvas(img) {
    info.className = 'hidden';
    c.className = '';
    c.width = img.naturalWidth;
    c.height = img.naturalHeight;
    cx.drawImage(img, 0, 0);
    pixels = cx.getImageData(0, 0, img.naturalWidth, img.naturalHeight);
  }
  function dragover(ev) {
    this.classList.add('over');
    ev.preventDefault();
  }
  function dragleave(ev) {
    this.classList.remove('over');
  }
  function showcode() {
    var code = '' +
        '<!DOCTYPE HTML>\n'+
        '<html lang="en-US">\n'+
        '<head>\n\t<meta charset="UTF-8">\n\t'+
        '<title>Your Picked colours</title>\n\t<style type="text/css">';
    var items = document.querySelectorAll('#results li'),
        all = items.length;
    for(var i = 0; i < all; i++) {
      code += '\n\t\t.colour' + (i+1) + '{ background:' + 
              items[i].dataset.rgba.replace(/,/g,', ') + '; /* ' + 
              items[i].dataset.hex + ' */}';
    }
    code += '\n\t\tbody {background:#000;font-family:arial,sans-serif;color:#fff;}';
    code += '\n\t\tdiv {float:left;margin:5px;width:50px;height:50px; border:1px solid #fff;}';
    code += '\n\t</style>';
    code += '\n</head>\n<body>\n';
    for(i = 0; i < all; i++) {
      code += '\n\t<div class="colour' + (i + 1) + '"></div>';
    }     
    code += '\n</body>\n</html>';
    codebox.querySelector('textarea').value = code;
    codebox.classList.add('visible');
  }
  function hidecode() {
    codebox.classList.remove('visible');
  }
  function removecolour(ev) {
    var t = ev.target;
    if (t.tagName === 'BUTTON') {
      t.parentNode.classList.add('hideme');
    }
    ev.preventDefault();
  }
  function removeitem(ev) {
    ev.target.parentNode.removeChild(ev.target);
    store();
  }
  function store() {
    localStorage.mypickedcolours = results.innerHTML;
  }
  function retrieve() {
    if (localStorage.mypickedcolours && 
        localStorage.mypickedcolours.indexOf('<') !== -1) {
      results.innerHTML = localStorage.mypickedcolours;
    }
  }
  
/* Events */
  c.addEventListener('mousemove', readcolour, false);
  c.addEventListener('mouseout', paintdrop, false);
  getcodebutton.addEventListener('click', showcode ,false);
  results.addEventListener('click', removecolour ,false);
  hidecodebutton.addEventListener('click', hidecode ,false);
  c.addEventListener('click', setcolour ,false);
  drop.addEventListener('dragover', dragover, false);
  drop.addEventListener('dragleave', dragleave, false);
  drop.addEventListener('drop', getfile, false);
  results.addEventListener('transitionend', removeitem, false);
  results.addEventListener('webkitTransitionEnd', removeitem, false);

})();