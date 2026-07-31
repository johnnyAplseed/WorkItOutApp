// Service worker registration.
//
// Registered from every page because any of them can be the entry point once
// the app is installed to the home screen.
//
// The path is resolved from this script's own URL rather than hardcoded, because
// pages live at different depths (index.html at the root, content/*.html one
// level down) so no single relative path works from all of them. A service
// worker can only control pages at or below its own directory, so sw.js has to
// sit at the site root - resolving '../sw.js' against '<root>/scripts/pwa.js'
// lands there regardless of which page is loading.
//
// Requires a secure context: HTTPS, or localhost for local testing. Opening the
// files directly over file:// silently does nothing, which is expected.

// Ask the browser to stop treating our saved data as disposable.
//
// By default localStorage is "best-effort": Android can evict it when the device
// is low on space, which would wipe saved workouts. Requesting persistence
// exempts the origin from that. Chrome usually grants it silently for installed
// PWAs and declines for plain tabs; either way this is advisory, never fatal,
// and no substitute for the export on content/backup.html.
(function () {
    if (!navigator.storage || !navigator.storage.persist) {
        return;
    }

    navigator.storage.persisted()
        .then(function (already) {
            if (already) return null;
            return navigator.storage.persist();
        })
        .then(function (granted) {
            if (granted === false) {
                console.info('[pwa] persistent storage not granted; data may be evicted under storage pressure');
            }
        })
        .catch(function () {
            // Not supported or blocked by policy - nothing to do.
        });
})();

(function () {
    if (!('serviceWorker' in navigator)) {
        return;
    }

    // Must be read synchronously: document.currentScript is only set while this
    // script is executing, and is null by the time any later callback runs.
    var selfSrc = document.currentScript && document.currentScript.src;

    if (!selfSrc) {
        // Very old browsers only. Deliberately not falling back to
        // location.href: '../sw.js' from a root-level page would resolve
        // ABOVE the site root and register nothing.
        var tags = document.getElementsByTagName('script');
        for (var i = 0; i < tags.length; i++) {
            if (tags[i].src && tags[i].src.indexOf('pwa.js') !== -1) {
                selfSrc = tags[i].src;
                break;
            }
        }
    }

    if (!selfSrc) {
        return;
    }

    var swUrl = new URL('../sw.js', selfSrc).href;

    window.addEventListener('load', function () {
        navigator.serviceWorker.register(swUrl)
            .catch(function (err) {
                // Never fatal - the app works fine online without a worker.
                console.warn('[pwa] service worker registration failed:', err);
            });
    });
})();
