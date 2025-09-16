// ===================================================================================
// DAREMON Radio ETS - Service Worker v10.2
//
// Fixed Issues:
// - Partial response (206) caching errors
// - Better error handling for media files
// - Improved cache strategies
// ===================================================================================

const CACHE_NAME = 'daremon-radio-v10-2';
const CACHE_VERSION = '10.2.0';

// Core app shell assets (critical for app functionality)
const APP_SHELL_ASSETS = [
    './',
    './index.html',
    './app.js',
    './styles.css',
    './project-panel.js',
    './project-panel.css',
    './manifest.json',
    './playlist.json'
];

// Optional assets (nice to have but not critical)
const OPTIONAL_ASSETS = [
    './machine-planning.html',
    './project-management.html',
    './project-panel.html',
    './locales/nl.json',
    './locales/pl.json',
    './icons/favicon.svg',
    './icons/icon-192x192.png',
    './icons/icon-512x512.png'
];

// Install event - cache core assets
self.addEventListener('install', event => {
    console.log(`[SW] Installing version ${CACHE_VERSION}...`);
    
    event.waitUntil(
        Promise.all([
            // Cache core app shell
            caches.open(CACHE_NAME).then(cache => {
                console.log('[SW] Caching app shell assets...');
                return cache.addAll(APP_SHELL_ASSETS);
            }),
            // Cache optional assets (don't fail if some are missing)
            caches.open(CACHE_NAME).then(cache => {
                console.log('[SW] Caching optional assets...');
                return Promise.allSettled(
                    OPTIONAL_ASSETS.map(asset => 
                        cache.add(asset).catch(err => {
                            console.warn(`[SW] Failed to cache optional asset: ${asset}`, err);
                        })
                    )
                );
            })
        ]).then(() => {
            console.log('[SW] Installation complete');
        }).catch(err => {
            console.error('[SW] Installation failed:', err);
            throw err;
        })
    );
    
    // Skip waiting to activate immediately
    self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    console.log(`[SW] Activating version ${CACHE_VERSION}...`);
    
    event.waitUntil(
        Promise.all([
            // Clean up old caches
            caches.keys().then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (cacheName !== CACHE_NAME) {
                            console.log(`[SW] Deleting old cache: ${cacheName}`);
                            return caches.delete(cacheName);
                        }
                    })
                );
            }),
            // Claim all clients
            self.clients.claim()
        ]).then(() => {
            console.log('[SW] Activation complete');
        })
    );
});

// Fetch event - handle requests with appropriate caching strategy
self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);
    const request = event.request;
    
    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }
    
    // Skip cross-origin requests (except for known CDNs)
    if (url.origin !== location.origin && !isTrustedOrigin(url.origin)) {
        return;
    }
    
    // Skip media files that might return partial responses
    if (isMediaFile(url.pathname)) {
        console.log('[SW] Skipping cache for media file:', url.pathname);
        return; // Let browser handle media files directly
    }
    
    event.respondWith(handleRequest(request, url));
});

// Handle different types of requests
async function handleRequest(request, url) {
    try {
        // Determine caching strategy based on request type
        if (isAppShellRequest(url)) {
            return await cacheFirst(request);
        } else if (isApiDataRequest(url)) {
            return await staleWhileRevalidate(request);
        } else {
            return await networkFirst(request);
        }
    } catch (error) {
        console.error('[SW] Request handling failed:', error);
        return await getFallbackResponse(request, url);
    }
}

// Cache-first strategy (for app shell)
async function cacheFirst(request) {
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
        // Return cached version immediately
        return cachedResponse;
    }
    
    try {
        // Fetch from network and cache
        const networkResponse = await fetch(request);
        if (networkResponse.ok && networkResponse.status === 200) {
            // Only cache complete responses (status 200)
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        console.warn('[SW] Network request failed:', request.url, error);
        throw error;
    }
}

// Stale-while-revalidate strategy (for API data)
async function staleWhileRevalidate(request) {
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    // Always try to fetch fresh data in background
    const fetchPromise = fetch(request).then(response => {
        if (response.ok && response.status === 200) {
            // Only cache complete responses
            cache.put(request, response.clone());
        }
        return response;
    }).catch(error => {
        console.warn('[SW] Background fetch failed:', request.url, error);
        return cachedResponse;
    });
    
    // Return cached version immediately if available, otherwise wait for network
    return cachedResponse || await fetchPromise;
}

// Network-first strategy (for other requests)
async function networkFirst(request) {
    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok && networkResponse.status === 200) {
            // Only cache complete responses
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        console.warn('[SW] Network request failed, trying cache:', request.url);
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        throw error;
    }
}

// Get fallback response for failed requests
async function getFallbackResponse(request, url) {
    const cache = await caches.open(CACHE_NAME);
    
    // Try to return cached version
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
        return cachedResponse;
    }
    
    // Return appropriate fallback based on request type
    if (request.destination === 'document') {
        const fallbackPage = await cache.match('./index.html');
        if (fallbackPage) {
            return fallbackPage;
        }
    }
    
    if (isApiDataRequest(url)) {
        return new Response(
            JSON.stringify({ error: 'Offline', cached: false }),
            { 
                status: 503,
                statusText: 'Service Unavailable',
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
    
    // Generic fallback
    return new Response(
        'Content not available offline',
        { 
            status: 503,
            statusText: 'Service Unavailable',
            headers: { 'Content-Type': 'text/plain' }
        }
    );
}

// Helper functions to categorize requests
function isAppShellRequest(url) {
    const appShellPaths = [
        '/',
        '/index.html',
        '/app.js',
        '/styles.css',
        '/manifest.json'
    ];
    return appShellPaths.includes(url.pathname);
}

function isApiDataRequest(url) {
    return url.pathname.endsWith('.json') || 
           url.pathname.includes('/api/') ||
           url.pathname.includes('/locales/');
}

function isMediaFile(pathname) {
    const mediaExtensions = ['.mp3', '.wav', '.ogg', '.m4a', '.mp4', '.webm'];
    return mediaExtensions.some(ext => pathname.toLowerCase().includes(ext));
}

function isTrustedOrigin(origin) {
    const trustedOrigins = [
        'https://fonts.googleapis.com',
        'https://fonts.gstatic.com',
        'https://cdnjs.cloudflare.com'
    ];
    return trustedOrigins.includes(origin);
}

// Handle service worker updates
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        console.log('[SW] Received SKIP_WAITING message');
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'GET_VERSION') {
        event.ports[0].postMessage({
            type: 'VERSION',
            version: CACHE_VERSION
        });
    }
});

console.log(`[SW] Service Worker ${CACHE_VERSION} loaded successfully`);