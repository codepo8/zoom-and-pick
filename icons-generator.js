(function(){

  var c = document.querySelector('canvas');
  var cx = c.getContext('2d');
  var thumbs = document.querySelector('#thumbs');
  var createbutton = document.querySelector('#create');
  var downloadbutton = document.querySelector('#download');
  var resizecanvas = document.createElement('canvas');
  var resizecontext = resizecanvas.getContext('2d');
  var sizes = [[16,16],[32,32],[48,48],[64,64],[128,128],[256,256]];
  var canvassize = [256,256];
  var zip;
  var mousedown = false;

  function getdroppedimage(ev) {
    c.classList.remove('over');
    var files = ev.dataTransfer.files;
    if (files.length > 0) {
      if (files[0].type.indexOf('image') !== -1) {
        var reader = new FileReader();
        reader.readAsDataURL(files[0]);
        reader.onload = function(ev) {
          addtocanvas(ev.target.result);
          };
        }
     }
  }

  function addtocanvas(src) {
    var img = new Image();
    img.src = src;
    img.onload = function() {
      var w = img.naturalWidth;
      var h = img.naturalHeight;
      c.width = canvassize[0];
      c.height = canvassize[1];
      /* TODO: center non-square pictures */
      cx.drawImage(img, 0, 0);
      pixels = cx.getImageData(0, 0, w, h);

      c.addEventListener('mousedown', function(ev) {
        mousedown = true;
      }, false);
      c.addEventListener('mouseup', function(ev) {
        mousedown = false;
      }, false);
      c.addEventListener('mousemove', function(ev) {
        if (!mousedown) {return;}
          cx.clearRect(0,0,256,256);
          var x = ev.pageX - c.offsetLeft - 50;
          var y = ev.pageY - c.offsetTop - 50;
          cx.drawImage(img, x, y);
      }, false);
    createbutton.disabled = false;
    };
  }

  function createimages() {
    zip = new JSZip();
    var icons = zip.folder("icons");
    sizes.forEach(function(now) {
      resizecanvas.width = now[0];
      resizecanvas.height = now[1];
      resizecontext.drawImage(c,0,0,now[0],now[1]);
      var img = new Image();
      img.src = resizecanvas.toDataURL("image/png");
      icons.file(
        now[0] + 'x' + now[1]+'.png',
        img.src.substr(img.src.indexOf(',') + 1),
        { base64: true }
      );
      var item = document.createElement('li');
      item.appendChild(img);
      var span = document.createElement('span');
      span.innerHTML = now[0] + 'x' + now[1];
      item.appendChild(span);
      thumbs.appendChild(item);
    });
    downloadbutton.disabled = false;
  }

  function download() {
    saveAs(
      zip.generate({type: 'blob'}),
      'icons.zip'
    );
  }

  /* Event handlers */

  createbutton.addEventListener('click', function(ev) {
    createimages();
  }, false);
  downloadbutton.addEventListener('click', function(ev) {
    download();
  }, false);
  c.addEventListener('dragover', function(ev) {
    this.classList.add('over');
    ev.preventDefault();
  }, false);
  c.addEventListener('drop', function(ev) {
    getdroppedimage(ev);
    ev.preventDefault();
  }, false);

})();