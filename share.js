/* Clipp Kaili Daily — shared share helpers (Web Share API + clipboard fallback) */
(function(){
  'use strict';

  function showToast(msg){
    var t = document.querySelector('.share-toast');
    if(!t){
      t = document.createElement('div');
      t.className = 'share-toast';
      t.setAttribute('role', 'status');
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(t._ckHide);
    t._ckHide = setTimeout(function(){ t.classList.remove('show'); }, 2200);
  }

  function legacyCopy(text){
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    var ok = false;
    try { ok = document.execCommand('copy'); } catch(e){ ok = false; }
    document.body.removeChild(ta);
    return ok;
  }

  function copyText(text){
    if(navigator.clipboard && navigator.clipboard.writeText){
      return navigator.clipboard.writeText(text).then(
        function(){ return true; },
        function(){ return legacyCopy(text); }
      );
    }
    return Promise.resolve(legacyCopy(text));
  }

  /* opts: {title, text, url} — url optional */
  window.ckShare = function(opts){
    opts = opts || {};
    var text = opts.text || '';
    var full = text + (opts.url ? '\n' + opts.url : '');
    var data = { title: opts.title || 'Clipp Kaili Daily', text: text };
    if(opts.url){ data.url = opts.url; }

    function copyFallback(){
      copyText(full).then(function(ok){
        showToast(ok ? 'Copied!' : 'Copy failed — please try again');
      });
    }

    if(navigator.share){
      try {
        var r = navigator.share(data);
        if(r && r.catch){
          r.catch(function(err){
            /* User cancelling is silent; real failures fall back to copy */
            if(!err || err.name !== 'AbortError'){ copyFallback(); }
          });
        }
      } catch(e){ copyFallback(); }
      return;
    }
    copyFallback();
  };
})();
