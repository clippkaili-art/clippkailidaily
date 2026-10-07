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
  /* WhatsApp share: opens wa.me with prefilled text */
  window.ckWhatsApp = function(opts){
    opts = opts || {};
    var text = (opts.text || '') + (opts.url ? '\n' + opts.url : '');
    var url = 'https://wa.me/?text=' + encodeURIComponent(text);
    window.open(url, '_blank', 'noopener');
  };

  /* Auto-inject WhatsApp button next to every [data-share-story] button */
  function injectWhatsApp(){
    document.querySelectorAll('[data-share-story]').forEach(function(btn){
      if(btn.nextElementSibling && btn.nextElementSibling.hasAttribute('data-wa-share')) return;
      var wa = document.createElement('button');
      wa.className = 'share-btn';
      wa.type = 'button';
      wa.setAttribute('data-wa-share', '');
      wa.style.background = '#25D366'; wa.style.borderColor = '#25D366'; wa.style.color = '#fff';
      wa.textContent = 'Share on WhatsApp';
      wa.addEventListener('click', function(){
        var title = '', h1 = document.querySelector('.reader h1');
        if(h1) title = h1.textContent.trim();
        ckWhatsApp({text: (title ? title + ' — via Clipp Kaili Daily' : 'Clipp Kaili Daily'), url: window.location.href});
      });
      btn.parentNode.insertBefore(wa, btn.nextSibling);
    });
  }
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', injectWhatsApp);
  }else{
    injectWhatsApp();
  }
})();
