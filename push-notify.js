/* Clipp Kaili Daily — Push Notification opt-in (double opt-in, 20s delay)
 * Requires OneSignal App ID to activate. Set ONESIGNAL_APP_ID below.
 * English only. Black & gold theme.
 */
(function () {
  "use strict";

  // TODO: Replace with your OneSignal App ID from onesignal.com
  var ONESIGNAL_APP_ID = "YOUR_ONESIGNAL_APP_ID_HERE";

  var PROMPT_DELAY_MS = 20000; // 20 seconds
  var DISMISS_DAYS = 7; // don't re-show for 7 days after "Maybe Later"
  var LS_KEY = "ckd_push_prompt";

  // Do nothing until OneSignal is configured
  if (!ONESIGNAL_APP_ID || ONESIGNAL_APP_ID === "YOUR_ONESIGNAL_APP_ID_HERE") {
    return;
  }

  // Don't run if push not supported
  if (!("Notification" in window) || !("serviceWorker" in navigator)) {
    return;
  }

  // Respect previous choice
  try {
    var saved = JSON.parse(localStorage.getItem(LS_KEY) || "{}");
    if (saved.subscribed) return;
    if (saved.dismissedAt && Date.now() - saved.dismissedAt < DISMISS_DAYS * 86400000) return;
    if (Notification.permission === "denied") return;
  } catch (e) {}

  function save(state) {
    try { localStorage.setItem(LS_KEY, JSON.stringify(state)); } catch (e) {}
  }

  // Load OneSignal SDK
  var sdk = document.createElement("script");
  sdk.src = "https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js";
  sdk.defer = true;
  document.head.appendChild(sdk);

  window.OneSignalDeferred = window.OneSignalDeferred || [];
  window.OneSignalDeferred.push(function (OneSignal) {
    OneSignal.init({ appId: ONESIGNAL_APP_ID });

    setTimeout(showPrompt, PROMPT_DELAY_MS);

    function showPrompt() {
      if (Notification.permission !== "default") return;
      try {
        var s = JSON.parse(localStorage.getItem(LS_KEY) || "{}");
        if (s.subscribed || s.dismissedAt) return;
      } catch (e) {}

      var wrap = document.createElement("div");
      wrap.id = "ckd-push-prompt";
      wrap.setAttribute("role", "dialog");
      wrap.setAttribute("aria-label", "Enable notifications");
      wrap.innerHTML =
        '<div style="position:fixed;left:16px;right:16px;bottom:16px;z-index:9999;' +
        'max-width:420px;margin:0 auto;background:#141414;border:1px solid #c9a961;' +
        'border-radius:16px;padding:20px 22px;text-align:center;' +
        'box-shadow:0 8px 32px rgba(0,0,0,.5);font-family:inherit;">' +
        '<p style="color:#c9a961;font-size:18px;font-weight:700;margin:0 0 6px;">' +
        'Never miss a heart-touching story 🔔</p>' +
        '<p style="color:#e8e2d4;font-size:14px;margin:0 0 16px;line-height:1.5;">' +
        'Get notified when a new story is published.</p>' +
        '<div style="display:flex;gap:10px;justify-content:center;">' +
        '<button id="ckd-push-yes" style="padding:11px 26px;font-size:15px;font-weight:700;' +
        'border:none;border-radius:999px;background:#c9a961;color:#111;cursor:pointer;">' +
        'Yes, Notify Me</button>' +
        '<button id="ckd-push-later" style="padding:11px 22px;font-size:15px;' +
        'border:1px solid #555;border-radius:999px;background:transparent;' +
        'color:#aaa;cursor:pointer;">Maybe Later</button>' +
        '</div></div>';

      document.body.appendChild(wrap);

      document.getElementById("ckd-push-yes").addEventListener("click", function () {
        OneSignal.Slidedown.promptPush();
        save({ subscribed: true, at: Date.now() });
        showThanks(wrap);
      });

      document.getElementById("ckd-push-later").addEventListener("click", function () {
        save({ dismissedAt: Date.now() });
        wrap.remove();
      });
    }

    function showThanks(wrap) {
      wrap.innerHTML =
        '<div style="position:fixed;left:16px;right:16px;bottom:16px;z-index:9999;' +
        'max-width:420px;margin:0 auto;background:#141414;border:1px solid #c9a961;' +
        'border-radius:16px;padding:20px 22px;text-align:center;' +
        'box-shadow:0 8px 32px rgba(0,0,0,.5);font-family:inherit;">' +
        '<p style="color:#c9a961;font-size:18px;font-weight:700;margin:0;">' +
        "You're subscribed! 💛</p></div>";
      setTimeout(function () { wrap.remove(); }, 4000);
    }
  });
})();
