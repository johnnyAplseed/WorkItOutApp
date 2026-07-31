// Android hardware / gesture back button handling.
//
// This app is multi-page: every screen is its own .html file, so the WebView
// builds up real history entries as you navigate. Without this, Android's back
// gesture closes the whole app from any screen instead of stepping back one
// page, which feels broken once it's wrapped for Android.
//
// Runs only inside a Capacitor shell. In a plain browser (or as a PWA) there is
// no hardware back button to intercept and window.Capacitor is undefined, so
// this file is inert and safe to load everywhere.

(function () {
    function registerBackButtonHandler() {
        var capacitor = window.Capacitor;
        var CapApp = capacitor && capacitor.Plugins && capacitor.Plugins.App;

        if (!CapApp) {
            // Plain browser / PWA: nothing to wire up.
            return;
        }

        CapApp.addListener('backButton', function (event) {
            // Prefer Capacitor's own view of history, fall back to the WebView's.
            var canGoBack = event && typeof event.canGoBack === 'boolean'
                ? event.canGoBack
                : window.history.length > 1;

            if (canGoBack) {
                window.history.back();
            } else {
                // Already at the entry screen - let back exit as the user expects.
                CapApp.exitApp();
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', registerBackButtonHandler);
    } else {
        registerBackButtonHandler();
    }
})();
