// Export / import all saved data as a JSON file.
//
// Why this exists: everything the app saves lives in localStorage, which is
// scoped to one origin on one device with no backup. Clearing site data, or
// losing the phone, loses every workout permanently. This is also the only way
// to move data across an origin boundary - from the web app to a future
// Capacitor build, or to a custom domain - because localStorage cannot be read
// across origins by any means.
//
// Everything in localStorage is exported rather than a known list of keys.
// The app's keys have no shared prefix to filter on: alongside fixed names like
// "Workouts" and "New Profile Info" there are date-stamped keys ("Water Score
// Mon Jul 13 2026") and keys named after the workout itself, both bare and
// "_history"-suffixed. A whitelist would silently miss saved workouts, which is
// exactly the data most worth protecting.

var WorkItOutBackup = (function () {
    var FORMAT = 1;
    var APP_ID = 'work-it-out';

    function readAll() {
        var data = {};
        for (var i = 0; i < localStorage.length; i++) {
            var key = localStorage.key(i);
            data[key] = localStorage.getItem(key);
        }
        return data;
    }

    function setStatus(message, isError) {
        var el = document.getElementById('backup_status');
        if (!el) return;
        el.textContent = message;
        el.style.color = isError ? '#990000' : 'rgb(48, 48, 48)';
    }

    function stamp() {
        // Local date, not ISO/UTC, so a late-evening export doesn't get
        // tomorrow's date in the filename.
        var d = new Date();
        function pad(n) { return (n < 10 ? '0' : '') + n; }
        return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
    }

    function exportData() {
        var data = readAll();
        var count = Object.keys(data).length;

        if (count === 0) {
            setStatus('Nothing saved yet - no data to export.', true);
            return;
        }

        var payload = {
            app: APP_ID,
            format: FORMAT,
            exported_at: new Date().toISOString(),
            origin: location.origin,
            key_count: count,
            data: data
        };

        var blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
        var url = URL.createObjectURL(blob);

        var a = document.createElement('a');
        a.href = url;
        a.download = 'work-it-out-backup-' + stamp() + '.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        // Revoking immediately can cancel the download in some browsers.
        setTimeout(function () { URL.revokeObjectURL(url); }, 30000);

        setStatus('Exported ' + count + ' item' + (count === 1 ? '' : 's') + '.');
    }

    function importData(file) {
        if (!file) return;

        var reader = new FileReader();

        reader.onerror = function () {
            setStatus('Could not read that file.', true);
        };

        reader.onload = function () {
            var payload;
            try {
                payload = JSON.parse(reader.result);
            } catch (err) {
                setStatus('That is not a valid JSON file.', true);
                return;
            }

            if (!payload || payload.app !== APP_ID) {
                setStatus('That file is not a Work It Out backup.', true);
                return;
            }
            if (payload.format !== FORMAT) {
                setStatus('Unsupported backup format (' + payload.format + ').', true);
                return;
            }
            if (!payload.data || typeof payload.data !== 'object') {
                setStatus('Backup file has no data in it.', true);
                return;
            }

            var keys = Object.keys(payload.data);
            if (keys.length === 0) {
                setStatus('Backup file is empty - nothing to restore.', true);
                return;
            }

            var existing = Object.keys(readAll()).length;
            var message = 'Restore ' + keys.length + ' item' + (keys.length === 1 ? '' : 's') +
                ' from this backup?';
            if (existing > 0) {
                message += '\n\nAnything with the same name will be overwritten. ' +
                    'Data not in the backup is left alone.';
            }
            if (!window.confirm(message)) {
                setStatus('Import cancelled.');
                return;
            }

            var written = 0;
            var failed = [];
            for (var i = 0; i < keys.length; i++) {
                var value = payload.data[keys[i]];
                if (typeof value !== 'string') {
                    failed.push(keys[i]);
                    continue;
                }
                try {
                    localStorage.setItem(keys[i], value);
                    written++;
                } catch (err) {
                    // Most likely the storage quota; report rather than half-fail silently.
                    failed.push(keys[i]);
                }
            }

            if (failed.length) {
                setStatus('Restored ' + written + ' of ' + keys.length +
                    '. Failed: ' + failed.join(', '), true);
            } else {
                setStatus('Restored ' + written + ' item' + (written === 1 ? '' : 's') + '.');
            }
        };

        reader.readAsText(file);
    }

    return {
        exportData: exportData,
        importData: importData
    };
})();

document.addEventListener('DOMContentLoaded', function () {
    var exportBtn = document.getElementById('export_button');
    var importBtn = document.getElementById('import_button');
    var fileInput = document.getElementById('import_file');

    if (exportBtn) {
        exportBtn.addEventListener('click', WorkItOutBackup.exportData);
    }

    if (importBtn && fileInput) {
        // The file input stays hidden so the page can use the app's button styling.
        importBtn.addEventListener('click', function () { fileInput.click(); });
        fileInput.addEventListener('change', function () {
            WorkItOutBackup.importData(fileInput.files[0]);
            // Reset so picking the same file twice still fires a change event.
            fileInput.value = '';
        });
    }
});
