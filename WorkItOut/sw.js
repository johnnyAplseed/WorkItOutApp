// Service worker for Work It Out.
//
// Makes the app work with no connection at all, which is the point: you use it
// at the gym, where signal is often bad. Every asset is precached on install,
// so after the first visit nothing needs the network.
//
// CACHE_VERSION is rewritten to the deploying commit SHA by
// .github/workflows/pages.yml. Left as the literal placeholder when served
// straight from a checkout, which works fine - it just means the cache name
// doesn't change between local runs.
const CACHE_VERSION = '__CACHE_VERSION__';
const CACHE_NAME = 'work-it-out-' + CACHE_VERSION;

// Generated from the file tree; regenerate if you add assets.
const PRECACHE_URLS = [
    './',
    'additions/add_calories.html',
    'additions/add_timer.html',
    'additions/add_water.html',
    'additions/add_workout.html',
    'additions/add_workout_table.html',
    'additions/edit_progress.html',
    'content/calories.html',
    'content/home.html',
    'content/profile.html',
    'content/profile_new.html',
    'content/progress.html',
    'content/timer.html',
    'content/water.html',
    'content/workouts.html',
    'font/Azonix.otf',
    'images/Backgrounds/bg1.webp',
    'images/Backgrounds/bg2.webp',
    'images/Backgrounds/bg3.webp',
    'images/Backgrounds/bg4.webp',
    'images/Backgrounds/bg5.webp',
    'images/Backgrounds/bg6.webp',
    'images/Backgrounds/bg7.webp',
    'images/Backgrounds/bg8.webp',
    'images/Backgrounds/bg9.webp',
    'images/enter-the-six-pack-5.jpg',
    'images/FlexedBicep.png',
    'images/icons/apple-touch-icon.png',
    'images/icons/icon-192.png',
    'images/icons/icon-512.png',
    'images/icons/icon-maskable-512.png',
    'images/trash-can-icon.jpg',
    'images/trash-can.png',
    'images/water_cup.PNG',
    'images/work_it_out_logo.png',
    'images/work_it_out_logo_square.png',
    'images/work_it_out_logo_square_back.png',
    'images/work_it_out_logo_square_plain.png',
    'images/work_it_out_logo_workouts.png',
    'index.html',
    'manifest.webmanifest',
    'scripts/add_calorie_management.js',
    'scripts/add_custom_workout_table.js',
    'scripts/add_workout_table.js',
    'scripts/anyWorkout.js',
    'scripts/calorie_management.js',
    'scripts/choose_bg_image.js',
    'scripts/display_workouts.js',
    'scripts/navigation.js',
    'scripts/profile_management.js',
    'scripts/profile_management_with_versioning.js',
    'scripts/pwa.js',
    'scripts/timer_management.js',
    'scripts/water_management.js',
    'scripts/working_out.js',
    'stylesheets/styles.css',
    'workouts/anyWorkout.html',
    'workouts/calisthenics.html',
    'workouts/default_workout.html',
    'workouts/EntterTheSixPack.html',
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            // Individual puts rather than cache.addAll: addAll rejects
            // atomically, so one bad URL would silently leave the app with no
            // offline cache at all.
            .then((cache) => Promise.all(
                PRECACHE_URLS.map((url) => cache.add(url).catch((err) => {
                    console.warn('[sw] precache failed for', url, err);
                }))
            ))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((names) => Promise.all(
                names
                    .filter((name) => name.startsWith('work-it-out-') && name !== CACHE_NAME)
                    .map((name) => caches.delete(name))
            ))
            .then(() => self.clients.claim())
    );
});

// Stale-while-revalidate: serve from cache instantly (fast, works offline),
// then refresh the entry in the background so the next load is current. A
// deploy therefore shows up one navigation later rather than needing a
// version bump.
self.addEventListener('fetch', (event) => {
    const request = event.request;

    if (request.method !== 'GET') return;
    if (new URL(request.url).origin !== self.location.origin) return;

    event.respondWith(
        caches.open(CACHE_NAME).then((cache) =>
            cache.match(request).then((cached) => {
                const network = fetch(request)
                    .then((response) => {
                        if (response && response.status === 200 && response.type === 'basic') {
                            cache.put(request, response.clone());
                        }
                        return response;
                    })
                    .catch(() => null);

                if (cached) {
                    return cached;   // network keeps running to refresh the cache
                }

                return network.then((response) => {
                    if (response) return response;
                    // Offline and never cached. For a page navigation, fall back
                    // to the entry screen so the app opens instead of showing
                    // the browser's error page.
                    if (request.mode === 'navigate') {
                        return cache.match('./') || cache.match('index.html');
                    }
                    return Response.error();
                });
            })
        )
    );
});
